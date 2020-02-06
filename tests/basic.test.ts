import { getModelForClass, plugin, prop } from '@typegoose/typegoose';
import * as mongoose from 'mongoose';
import { AutoIncrement } from '../src/autoIncrement';
import { connect, disconnect } from './utils/mongooseConnect';

describe('Basic Suite', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('Basic Function Mongoose', async () => {
    const schema = new mongoose.Schema({
      somefield: Number
    });
    schema.plugin(AutoIncrement, [{ field: 'somefield' }]);
    const model = mongoose.model('SomeModel', schema);

    const doc: mongoose.Document & { somefield: number; } = await model.create({ somefield: 10 }) as any;
    expect(doc.somefield).toBe(10);

    await doc.save();
    expect(doc.somefield).toBe(11);
  });

  it('Basic Function Typegoose', async () => {
    @plugin/* <AutoIncrementOptions> */(AutoIncrement, [{ field: 'someIncrementedField' }])
    class SomeClass {
      @prop({ required: true })
      public someIncrementedField: number;
    }

    const SomeModel = getModelForClass(SomeClass);

    const doc = await SomeModel.create({ someIncrementedField: 10 });
    expect(doc.someIncrementedField).toBe(10);

    await doc.save();
    expect(doc.someIncrementedField).toBe(11);
  });
});

describe('Errors', () => {
  it('should Error if the schema path does not exist', () => {
    const schema = new mongoose.Schema({});
    expect(() => schema.plugin(AutoIncrement, { field: 'SomeNonExistingField' })).toThrow(Error);
  });

  it('should Error if the schema path is not an number', () => {
    const schema = new mongoose.Schema({
      nonNumberField: String
    });
    expect(() => schema.plugin(AutoIncrement, { field: 'nonNumberField' })).toThrow(Error);
  });
});
