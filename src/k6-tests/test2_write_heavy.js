 import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
 
const BASE_URL = 'http://localhost:3000/api/v1';
 
const responseTrend = new Trend('write_response_time');
const errorRate = new Rate('write_error_rate');
const successCounter = new Counter('successful_reports');
 
export const options = {
  stages: [
    { duration: '30s', target: 50 }, 
    { duration: '1m',  target: 50 }, 
    { duration: '30s', target: 0 },  
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    write_error_rate: ['rate<0.1'],
  },
};
 

export function setup() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: 'rama@test.com', password: 'rama123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  console.log('Login status:', res.status);
  console.log('Login body:', res.body); 
  
  const token = res.json('token');
  console.log('Token extracted:', token);

  return { token: token };
}
 

const reportTemplates = [
  { title: 'طريق مسكر', description: 'الطريق مسكر بسبب حجارة', location: 'نابلس', category: 'closure', latitude: 32.1520, longitude: 35.2620 },
  { title: 'ازدحام شديد', description: 'ازدحام عند الحاجز', location: 'رام الله', category: 'delay', latitude: 31.8456, longitude: 35.2244 },
  { title: 'حادث سير', description: 'حادث على الطريق الرئيسي', location: 'بيت لحم', category: 'accident', latitude: 31.6543, longitude: 35.2987 },
  { title: 'أمطار غزيرة', description: 'أمطار غزيرة على الطريق', location: 'جنين', category: 'weather', latitude: 32.4644, longitude: 35.2960 },
  { title: 'حاجز جديد', description: 'حاجز عسكري مؤقت', location: 'الخليل', category: 'checkpoint', latitude: 31.5326, longitude: 35.0998 },
  { title: 'حادث آخر', description: 'اصطدام مركبات', location: 'أريحا', category: 'accident', latitude: 31.8613, longitude: 35.4614 },
];
 
export default function (data) {
  if (!data.token) {
    console.warn('No token available, skipping...');
    sleep(1);
    return;
  }
 
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };
 
  
  const template = reportTemplates[Math.floor(Math.random() * reportTemplates.length)];
 
  
  const report = {
  ...template,
  title: `${template.title} - ${__VU}-${__ITER}`, 
  latitude: template.latitude + (Math.random() * 0.5),  
  longitude: template.longitude + (Math.random() * 0.5),
};
 
  const res = http.post(
    `${BASE_URL}/reports`,
    JSON.stringify(report),
    { headers }
  );
 
if (__ITER < 3) console.log('Response:', res.status, res.body);

  responseTrend.add(res.timings.duration);
  errorRate.add(res.status !== 200 && res.status !== 201);
 
  const success = check(res, {
    'POST /reports - status 201 or 200': (r) => r.status === 201 || r.status === 200,
    'POST /reports - response time < 3s': (r) => r.timings.duration < 3000,
  });
 
  if (success) successCounter.add(1);
 
  sleep(1);
}