import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = 'http://localhost:3000/api/v1';

const responseTrend = new Trend('response_time');
const errorRate = new Rate('error_rate');

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m',  target: 500 },
    { duration: '1m',  target: 500 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    error_rate: ['rate<0.05'],
  },
};

export default function () {
  let res = http.get(`${BASE_URL}/incidents`);
  responseTrend.add(res.timings.duration);
  errorRate.add(res.status !== 200);
  check(res, {
    'GET /incidents - status 200': (r) => r.status === 200,
  });

  sleep(0.5);

  res = http.get(`${BASE_URL}/incidents?incident_type=closure`);
  responseTrend.add(res.timings.duration);
  errorRate.add(res.status !== 200);
  check(res, {
    'GET /incidents?type=closure - status 200': (r) => r.status === 200,
  });

  sleep(0.5);

  res = http.get(`${BASE_URL}/incidents?page=1&limit=10`);
  responseTrend.add(res.timings.duration);
  errorRate.add(res.status !== 200);
  check(res, {
    'GET /incidents pagination - status 200': (r) => r.status === 200,
  });

  sleep(1);
}