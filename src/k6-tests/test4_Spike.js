import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
 
const BASE_URL = 'http://localhost:3000/api/v1';
 
const errorRate = new Rate('spike_error_rate');
const responseTrend = new Trend('spike_response_time');
 
export const options = {
  stages: [
    { duration: '10s', target: 5 },   // بداية هادئة
    { duration: '10s', target: 100 }, // SPIKE! - ارتفاع مفاجئ لـ 100 مستخدم
    { duration: '1m',  target: 100 }, // ثبات على الضغط العالي
    { duration: '10s', target: 5 },   // نزول مفاجئ
    { duration: '30s', target: 5 },   // استقرار
    { duration: '10s', target: 0 },   // إنهاء
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // نسمح بـ 5 ثواني خلال الـ spike
    spike_error_rate: ['rate<0.15'],   // نقبل حتى 15% أخطاء خلال الـ spike
  },
};
 
export default function () {
  
  const requests = [
    `${BASE_URL}/incidents`,
    `${BASE_URL}/incidents?page=1&limit=5`,
    `${BASE_URL}/reports`,
    `${BASE_URL}/checkpoints`,
  ];
 
  const url = requests[Math.floor(Math.random() * requests.length)];
  const res = http.get(url);
 
  responseTrend.add(res.timings.duration);
  errorRate.add(res.status >= 500); 
 
  check(res, {
    'Spike - no 500 error': (r) => r.status < 500,
    'Spike - responded': (r) => r.status !== 0,
  });
 
  sleep(0.3);
}