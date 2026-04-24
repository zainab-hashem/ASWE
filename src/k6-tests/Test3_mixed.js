import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = 'http://localhost:3000/api/v1';

const readTrend = new Trend('read_response_time');
const writeTrend = new Trend('write_response_time');
const errorRate = new Rate('mixed_error_rate');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m',  target: 50 },
    { duration: '2m',  target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2500'],
    mixed_error_rate: ['rate<0.08'],
  },
};

export function setup() {
  const citizenLogin = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: 'rama@test.com', password: 'rama123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  return {
    citizenToken: citizenLogin.status === 200 ? citizenLogin.json('token') : null,
  };
}

const cities = [
  { location: 'نابلس', lat: 32.15, lng: 35.26 },
  { location: 'رام الله', lat: 31.84, lng: 35.22 },
  { location: 'جنين', lat: 32.46, lng: 35.29 },
  { location: 'الخليل', lat: 31.53, lng: 35.09 },
  { location: 'أريحا', lat: 31.86, lng: 35.46 },
  { location: 'طولكرم', lat: 32.31, lng: 35.02 },
  { location: 'قلقيلية', lat: 32.18, lng: 34.97 },
  { location: 'سلفيت', lat: 32.08, lng: 35.17 },
];

export default function (data) {
  const rand = Math.random();

  if (rand < 0.7) {
    
    const readScenarios = [
      () => {
        const res = http.get(`${BASE_URL}/incidents`);
        readTrend.add(res.timings.duration);
        errorRate.add(res.status !== 200);
        check(res, { 'GET incidents': (r) => r.status === 200 });
      },
      () => {
        const res = http.get(`${BASE_URL}/reports`);
        readTrend.add(res.timings.duration);
        errorRate.add(res.status !== 200);
        check(res, { 'GET reports': (r) => r.status === 200 });
      },
      () => {
        const res = http.get(`${BASE_URL}/checkpoints`);
        readTrend.add(res.timings.duration);
        errorRate.add(res.status !== 200);
        check(res, { 'GET checkpoints': (r) => r.status === 200 });
      },
      () => {
        const res = http.get(`${BASE_URL}/incidents?severity=high`);
        readTrend.add(res.timings.duration);
        errorRate.add(res.status !== 200);
        check(res, { 'GET incidents filtered': (r) => r.status === 200 });
      },
    ];

    const scenario = readScenarios[Math.floor(Math.random() * readScenarios.length)];
    scenario();

  } else {
    
    if (!data.citizenToken) {
      sleep(1);
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.citizenToken}`,
    };

    const city = cities[__VU % cities.length];
    const report = {
      title: `تقرير ${__VU}-${__ITER}`,
      description: 'تقرير اختبار أداء',
      location: city.location,
      category: 'closure',
      latitude: city.lat + (Math.random() * 0.01),
      longitude: city.lng + (Math.random() * 0.01),
    };

    const res = http.post(`${BASE_URL}/reports`, JSON.stringify(report), { headers });
    writeTrend.add(res.timings.duration);
    errorRate.add(res.status !== 200 && res.status !== 201);
    check(res, {
      'POST report in mixed': (r) => r.status === 200 || r.status === 201,
    });
  }

  sleep(0.5);
}