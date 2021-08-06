import { connect, disconnect } from './mongooseConnect';

beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  await disconnect();
});
