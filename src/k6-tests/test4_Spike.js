import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
 
const BASE_URL = 'http://localhost:3000/api/v1';
 
const errorRate = new Rate('spike_error_rate');
const responseTrend = new Trend('spike_response_time');
 
export const options = {
  stages: [
    { duration: '10s', target: 5 },   
    { duration: '10s', target: 100 }, 
    { duration: '1m',  target: 100 }, 
    { duration: '10s', target: 5 },   
    { duration: '30s', target: 5 },   
    { duration: '10s', target: 0 },   
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], 
    spike_error_rate: ['rate<0.15'],   
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