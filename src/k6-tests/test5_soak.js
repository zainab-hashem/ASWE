import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = 'http://localhost:3000/api/v1';

const responseTrend = new Trend('soak_response_time');
const errorRate = new Rate('soak_error_rate');

export const options = {
  stages: [
    { duration: '1m',  target: 20 },
    { duration: '8m',  target: 20 },
    { duration: '1m',  target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    soak_error_rate: ['rate<0.05'],
  },
};

export function setup() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: 'rama@test.com', password: 'rama123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  return {
    token: res.status === 200 ? res.json('token') : null,
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

let requestCount = 0;

export default function (data) {
  requestCount++;
  const cycle = requestCount % 4;
  let res;

  if (cycle === 0) {
    res = http.get(`${BASE_URL}/incidents`);
    check(res, { 'Soak GET incidents': (r) => r.status === 200 });

  } else if (cycle === 1) {
    res = http.get(`${BASE_URL}/reports`);
    check(res, { 'Soak GET reports': (r) => r.status === 200 });

  } else if (cycle === 2) {
    res = http.get(`${BASE_URL}/checkpoints`);
    check(res, { 'Soak GET checkpoints': (r) => r.status === 200 });

  } else {
    if (data.token) {
      const city = cities[__VU % cities.length];
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      };
      res = http.post(
        `${BASE_URL}/reports`,
        JSON.stringify({
          title: `Soak test ${__VU}-${__ITER}`,
          description: 'اختبار الاستدامة',
          location: city.location,
          category: 'delay',
          latitude: city.lat + Math.random() * 0.5,
          longitude: city.lng + Math.random() * 0.5,
        }),
        { headers }
      );
      check(res, { 'Soak POST report': (r) => r.status === 200 || r.status === 201 });
    } else {
      res = http.get(`${BASE_URL}/incidents`);
    }
  }

  responseTrend.add(res.timings.duration);
  errorRate.add(res.status >= 400);
  sleep(1);
}