import { getModelForClass, modelOptions, plugin, prop } from '@typegoose/typegoose';
import { assertion } from '@typegoose/typegoose/lib/internal/utils';
import * as mongoose from 'mongoose';
import { AutoIncrementID, AutoIncrementSimple } from '../src/autoIncrement';

describe('Basic Suite', () => {
  describe('AutoIncrementSimple', () => {
    it('Basic Function Mongoose', async () => {
      const schema = new mongoose.Schema({
        somefield: Number,
      });
      schema.plugin(AutoIncrementSimple, [{ field: 'somefield' }]);
      const model = mongoose.model('AutoIncrementSimple-SomeModel', schema);

      const doc = await model.create({ somefield: 10 });
      expect(doc.somefield).toBe(10);

      await doc.save();
      expect(doc.somefield).toBe(11);
    });

    it('Basic Function Typegoose', async () => {
      @plugin(AutoIncrementSimple, [{ field: 'someIncrementedField' }])
      @modelOptions({ options: { customName: 'AutoIncrementSimple-SomeClass' } })
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

  describe('AutoIncrementID', () => {
    it('Basic Function Mongoose', async () => {
      const schema = new mongoose.Schema({
        _id: Number,
        somefield: Number,
      });
      schema.plugin(AutoIncrementID, {});
      const model = mongoose.model('AutoIncrementID-SomeModel', schema);

      // test initial 0
      {
        const doc = await model.create({ somefield: 10 });
        expect(doc.somefield).toBe(10);
        expect(doc._id).toBe(0);

        await doc.save();
        expect(doc.somefield).toBe(10);
        expect(doc._id).toBe(0);
      }

      // test add 1
      {
        const doc = await model.create({ somefield: 20 });
        expect(doc.somefield).toBe(20);
        expect(doc._id).toBe(1);

        await doc.save();
        expect(doc.somefield).toBe(20);
        expect(doc._id).toBe(1);
      }

      // test add another 1
      {
        const doc = await model.create({ somefield: 30 });
        expect(doc.somefield).toBe(30);
        expect(doc._id).toBe(2);

        await doc.save();
        expect(doc.somefield).toBe(30);
        expect(doc._id).toBe(2);
      }

      const trackerModel = mongoose.connection.models['identitycounter'];
      expect(Object.getPrototypeOf(trackerModel)).toStrictEqual(mongoose.Model);

      const foundTracker = await trackerModel.findOne({ modelName: 'AutoIncrementID-SomeModel' }).orFail();
      expect(foundTracker.count).toEqual(2);
    });

    it('Basic Function Typegoose', async () => {
      @plugin(AutoIncrementID, {})
      @modelOptions({ options: { customName: 'AutoIncrementID-SomeClass' } })
      class SomeClass {
        @prop()
        public _id?: number;

        @prop({ required: true })
        public someIncrementedField!: number;
      }

      const SomeModel = getModelForClass(SomeClass);

      // test initial 0
      {
        const doc = await SomeModel.create({ someIncrementedField: 10 });
        expect(doc.someIncrementedField).toBe(10);
        expect(doc._id).toBe(0);

        await doc.save();
        expect(doc.someIncrementedField).toBe(10);
        expect(doc._id).toBe(0);
      }

      // test add 1
      {
        const doc = await SomeModel.create({ someIncrementedField: 20 });
        expect(doc.someIncrementedField).toBe(20);
        expect(doc._id).toBe(1);

        await doc.save();
        expect(doc.someIncrementedField).toBe(20);
        expect(doc._id).toBe(1);
      }

      // test add another 1
      {
        const doc = await SomeModel.create({ someIncrementedField: 30 });
        expect(doc.someIncrementedField).toBe(30);
        expect(doc._id).toBe(2);

        await doc.save();
        expect(doc.someIncrementedField).toBe(30);
        expect(doc._id).toBe(2);
      }

      const trackerModel = mongoose.connection.models['identitycounter'];
      expect(Object.getPrototypeOf(trackerModel)).toStrictEqual(mongoose.Model);

      const foundTracker = await trackerModel.findOne({ modelName: 'AutoIncrementID-SomeClass' }).orFail();
      expect(foundTracker.count).toEqual(2);
    });

    it('Basic Function Mongoose With startAt', async () => {
      const schema = new mongoose.Schema({
        _id: Number,
        somefield: Number,
      });
      schema.plugin(AutoIncrementID, { startAt: 2 });
      const model = mongoose.model('AutoIncrementID-SomeModelStartAt', schema);

      const doc = await model.create({ somefield: 10 });
      expect(doc.somefield).toBe(10);
      expect(doc._id).toBe(2);

      await doc.save();
      expect(doc.somefield).toBe(10);
      expect(doc._id).toBe(2);

      expect(mongoose.connection.model('identitycounter')).not.toBeUndefined();
    });

    it('Basic Function Typegoose With startAt', async () => {
      @plugin(AutoIncrementID, { startAt: 5 })
      @modelOptions({ options: { customName: 'AutoIncrementID-SomeClassStartAt' } })
      class SomeClass {
        @prop()
        public _id?: number;

        @prop({ required: true })
        public someIncrementedField!: number;
      }

      const SomeModel = getModelForClass(SomeClass);

      const doc = await SomeModel.create({ someIncrementedField: 20 });
      expect(doc.someIncrementedField).toBe(20);
      expect(doc._id).toBe(5);

      await doc.save();
      expect(doc.someIncrementedField).toBe(20);
      expect(doc._id).toBe(5);

      expect(mongoose.connection.model('identitycounter')).not.toBeUndefined();
    });

    it('Should work if used in an sub-document', async () => {
      @plugin(AutoIncrementID, { startAt: 1 })
      @modelOptions({ options: { customName: 'AutoIncrementID-SubDoc' } })
      class SubDoc {
        @prop()
        public _id?: number;

        @prop({ required: true })
        public someField!: string;
      }

      @modelOptions({ options: { customName: 'AutoIncrementID-Parent' } })
      class Parent {
        @prop({ required: true })
        public nested!: SubDoc;
      }

      const ParentModel = getModelForClass(Parent);

      const doc1 = await ParentModel.create({ nested: { someField: 'hello1' } });
      expect(doc1.nested._id).toBe(1);

      await doc1.save();
      expect(doc1.nested._id).toBe(1);

      const doc2 = await ParentModel.create({ nested: { someField: 'hello2' } });
      expect(doc2.nested._id).toBe(2);
    });

    it('should make use of "overwriteModelName"', async () => {
      const schema1 = new mongoose.Schema({
        _id: Number,
        somefield: Number,
      });
      schema1.plugin(AutoIncrementID, { overwriteModelName: 'TestOverwrite' });
      const model1 = mongoose.model('AutoIncrementID-OMN1', schema1);

      const schema2 = new mongoose.Schema({
        _id: Number,
        somefield: Number,
      });
      schema2.plugin(AutoIncrementID, { overwriteModelName: 'TestOverwrite' });
      const model2 = mongoose.model('AutoIncrementID-OMN2', schema2);

      // test schema1 initial 0
      {
        const doc = await model1.create({ somefield: 10 });
        expect(doc.somefield).toBe(10);
        expect(doc._id).toBe(0);

        await doc.save();
        expect(doc.somefield).toBe(10);
        expect(doc._id).toBe(0);
      }

      // test schema1 add 1
      {
        const doc = await model1.create({ somefield: 20 });
        expect(doc.somefield).toBe(20);
        expect(doc._id).toBe(1);

        await doc.save();
        expect(doc.somefield).toBe(20);
        expect(doc._id).toBe(1);
      }

      // test schema2 add 1 & use same tracker
      {
        const doc = await model2.create({ somefield: 30 });
        expect(doc.somefield).toBe(30);
        expect(doc._id).toBe(2);

        await doc.save();
        expect(doc.somefield).toBe(30);
        expect(doc._id).toBe(2);
      }

      const trackerModel = mongoose.connection.models['identitycounter'];
      expect(Object.getPrototypeOf(trackerModel)).toStrictEqual(mongoose.Model);

      const foundTracker = await trackerModel.findOne({ modelName: 'TestOverwrite' }).orFail();
      expect(foundTracker.count).toEqual(2);
    });

    it('should use modelName if "overwriteModelName" is falsy', async () => {
      const schema = new mongoose.Schema({
        _id: Number,
        somefield: Number,
      });
      schema.plugin(AutoIncrementID, { overwriteModelName: '' });
      const model = mongoose.model('AutoIncrementID-EOMN', schema);

      const doc = await model.create({ somefield: 10 });
      expect(doc.somefield).toBe(10);
      expect(doc._id).toBe(0);

      await doc.save();
      expect(doc.somefield).toBe(10);
      expect(doc._id).toBe(0);

      const trackerModel = mongoose.connection.models['identitycounter'];
      expect(Object.getPrototypeOf(trackerModel)).toStrictEqual(mongoose.Model);

      const foundTracker = await trackerModel.findOne({ modelName: 'AutoIncrementID-EOMN' }).orFail();
      expect(foundTracker.count).toEqual(0);
    });

    it('should support "overwriteModelName" being a function', async () => {
      let fcalled = 0;

      const schema = new mongoose.Schema({
        _id: Number,
        somefield: Number,
      });
      schema.plugin(AutoIncrementID, {
        overwriteModelName: (modelName, model) => {
          fcalled += 1;
          expect(modelName).toStrictEqual('AutoIncrementID-OMNF');
          expect(Object.getPrototypeOf(model)).toStrictEqual(mongoose.Model);

          return 'AutoIncrementID-OMNF-test';
        },
      });
      const model = mongoose.model('AutoIncrementID-OMNF', schema);

      expect(fcalled).toStrictEqual(0);
      const doc = await model.create({ somefield: 10 });
      expect(fcalled).toStrictEqual(1);
      expect(doc.somefield).toBe(10);
      expect(doc._id).toBe(0);

      expect(fcalled).toStrictEqual(1);
      await doc.save();
      expect(fcalled).toStrictEqual(2);
      expect(doc.somefield).toBe(10);
      expect(doc._id).toBe(0);

      const trackerModel = mongoose.connection.models['identitycounter'];
      expect(Object.getPrototypeOf(trackerModel)).toStrictEqual(mongoose.Model);

      const foundTracker = await trackerModel.findOne({ modelName: 'AutoIncrementID-OMNF-test' }).orFail();
      expect(foundTracker.count).toEqual(0);
    });

    it('should throw a error if "overwriteModelName" is a function but returns a empty string', async () => {
      let fcalled = 0;

      const schema = new mongoose.Schema({
        _id: Number,
        somefield: Number,
      });
      schema.plugin(AutoIncrementID, {
        overwriteModelName: (modelName, model) => {
          fcalled += 1;
          expect(modelName).toStrictEqual('AutoIncrementID-OMNFEE');
          expect(Object.getPrototypeOf(model)).toStrictEqual(mongoose.Model);

          return '';
        },
      });
      const model = mongoose.model('AutoIncrementID-OMNFEE', schema);

      expect(fcalled).toStrictEqual(0);
      try {
        await model.create({ somefield: 10 });
        fail('Expected .create to fail');
      } catch (err) {
        expect(fcalled).toStrictEqual(1);
        expect(err).toBeInstanceOf(Error);
        assertion(err instanceof Error); // jest types do not do this for typescript
        expect(err.message).toMatchSnapshot();
      }
    });

    it('should throw a error if "overwriteModelName" is a function but returns not a string', async () => {
      let fcalled = 0;

      const schema = new mongoose.Schema({
        _id: Number,
        somefield: Number,
      });
      schema.plugin(AutoIncrementID, {
        // @ts-expect-error ReturnType should be string
        overwriteModelName: (modelName, model) => {
          fcalled += 1;
          expect(modelName).toStrictEqual('AutoIncrementID-OMNFENS');
          expect(Object.getPrototypeOf(model)).toStrictEqual(mongoose.Model);

          return 0;
        },
      });
      const model = mongoose.model('AutoIncrementID-OMNFENS', schema);

      expect(fcalled).toStrictEqual(0);
      try {
        await model.create({ somefield: 10 });
        fail('Expected .create to fail');
      } catch (err) {
        expect(fcalled).toStrictEqual(1);
        expect(err).toBeInstanceOf(Error);
        assertion(err instanceof Error); // jest types do not do this for typescript
        expect(err.message).toMatchSnapshot();
      }
    });
  });
});

describe('Errors', () => {
  it('should Error if the schema path does not exist', () => {
    const schema = new mongoose.Schema({});
    expect(() => schema.plugin(AutoIncrementSimple, { field: 'SomeNonExistingField' })).toThrowErrorMatchingSnapshot();
  });

  it('should Error if the schema path is not an number', () => {
    const schema = new mongoose.Schema({
      nonNumberField: String,
    });
    expect(() => schema.plugin(AutoIncrementSimple, { field: 'nonNumberField' })).toThrowErrorMatchingSnapshot();
  });
});
