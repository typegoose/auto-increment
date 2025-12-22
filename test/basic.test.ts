import { getModelForClass, modelOptions, plugin, prop } from '@typegoose/typegoose';
import { assertion } from '@typegoose/typegoose/lib/internal/utils';
import mongoose from 'mongoose';
import { AutoIncrementID, AutoIncrementIDSkipSymbol, AutoIncrementSimple } from '../src/autoIncrement';

describe('Basic Suite', () => {
  describe('AutoIncrementSimple', () => {
    it('Basic Function Mongoose (Number)', async () => {
      const schema = new mongoose.Schema({
        somefield: Number,
      });
      schema.plugin(AutoIncrementSimple, [{ field: 'somefield' }]);
      const model = mongoose.model('AutoIncrementSimple-SomeModel-Number', schema);

      const doc = await model.create({ somefield: 10 });
      expect(doc.somefield).toBe(10);

      await doc.save();
      expect(doc.somefield).toBe(11);
    });

    it('Basic Function Typegoose (Number)', async () => {
      @plugin(AutoIncrementSimple, [{ field: 'someIncrementedField' }])
      @modelOptions({ options: { customName: 'AutoIncrementSimple-SomeClass-Number' } })
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

    it('Basic Function Mongoose (BigInt)', async () => {
      const schema = new mongoose.Schema({
        somefield: BigInt,
      });
      schema.plugin(AutoIncrementSimple, [{ field: 'somefield' }]);
      const model = mongoose.model('AutoIncrementSimple-SomeModel-BigInt', schema);

      const doc = await model.create({ somefield: 10n });
      expect(doc.somefield).toBe(10n);

      await doc.save();
      expect(doc.somefield).toBe(11n);
    });

    it('Basic Function Typegoose (BigInt)', async () => {
      @plugin(AutoIncrementSimple, [{ field: 'someIncrementedField' }])
      @modelOptions({ options: { customName: 'AutoIncrementSimple-SomeClass-BigInt' } })
      class SomeClass {
        @prop({ required: true })
        public someIncrementedField: bigint;
      }

      const SomeModel = getModelForClass(SomeClass);

      const doc = await SomeModel.create({ someIncrementedField: 10n });
      expect(doc.someIncrementedField).toBe(10n);

      await doc.save();
      expect(doc.someIncrementedField).toBe(11n);
    });

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

    it('should Error if no field is given to AutoIncrementSimple', () => {
      const schema = new mongoose.Schema({
        nonNumberField: String,
      });
      expect(() => schema.plugin(AutoIncrementSimple, [])).toThrowErrorMatchingSnapshot();
    });

    it('should Error if no field is given to AutoIncrementSimple', () => {
      const schema = new mongoose.Schema({
        nonNumberField: String,
      });
      expect(() =>
        schema.plugin(
          AutoIncrementSimple,
          // @ts-expect-error TEST
          {}
        )
      ).toThrowErrorMatchingSnapshot();
    });
  });

  describe('AutoIncrementID', () => {
    it('Basic Function Mongoose (Number)', async () => {
      const schema = new mongoose.Schema({
        _id: Number,
        somefield: Number,
      });
      schema.plugin(AutoIncrementID, {});
      const model = mongoose.model('AutoIncrementID-SomeModel-Number', schema);

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

      const foundTracker = await trackerModel.findOne({ modelName: 'AutoIncrementID-SomeModel-Number' }).orFail();
      expect(foundTracker.count).toEqual(2n);
    });

    it('Basic Function Typegoose (Number)', async () => {
      @plugin(AutoIncrementID, {})
      @modelOptions({ options: { customName: 'AutoIncrementID-SomeClass-Number' } })
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

      const foundTracker = await trackerModel.findOne({ modelName: 'AutoIncrementID-SomeClass-Number' }).orFail();
      expect(foundTracker.count).toEqual(2n);
    });

    it('Basic Function Mongoose (BigInt)', async () => {
      const schema = new mongoose.Schema({
        _id: BigInt,
        somefield: Number,
      });
      schema.plugin(AutoIncrementID, {});
      const model = mongoose.model('AutoIncrementID-SomeModel-BigInt', schema);

      // test initial 0
      {
        const doc = await model.create({ somefield: 10 });
        expect(doc.somefield).toBe(10);
        expect(doc._id).toBe(0n);

        await doc.save();
        expect(doc.somefield).toBe(10);
        expect(doc._id).toBe(0n);
      }

      // test add 1
      {
        const doc = await model.create({ somefield: 20 });
        expect(doc.somefield).toBe(20);
        expect(doc._id).toBe(1n);

        await doc.save();
        expect(doc.somefield).toBe(20);
        expect(doc._id).toBe(1n);
      }

      // test add another 1
      {
        const doc = await model.create({ somefield: 30 });
        expect(doc.somefield).toBe(30);
        expect(doc._id).toBe(2n);

        await doc.save();
        expect(doc.somefield).toBe(30);
        expect(doc._id).toBe(2n);
      }

      const trackerModel = mongoose.connection.models['identitycounter'];
      expect(Object.getPrototypeOf(trackerModel)).toStrictEqual(mongoose.Model);

      const foundTracker = await trackerModel.findOne({ modelName: 'AutoIncrementID-SomeModel-BigInt' }).orFail();
      expect(foundTracker.count).toEqual(2n);
    });

    it('Basic Function Typegoose (BigInt)', async () => {
      @plugin(AutoIncrementID, {})
      @modelOptions({ options: { customName: 'AutoIncrementID-SomeClass-BigInt' } })
      class SomeClass {
        @prop()
        public _id?: bigint;

        @prop({ required: true })
        public someIncrementedField!: number;
      }

      const SomeModel = getModelForClass(SomeClass);

      // test initial 0
      {
        const doc = await SomeModel.create({ someIncrementedField: 10 });
        expect(doc.someIncrementedField).toBe(10);
        expect(doc._id).toBe(0n);

        await doc.save();
        expect(doc.someIncrementedField).toBe(10);
        expect(doc._id).toBe(0n);
      }

      // test add 1
      {
        const doc = await SomeModel.create({ someIncrementedField: 20 });
        expect(doc.someIncrementedField).toBe(20);
        expect(doc._id).toBe(1n);

        await doc.save();
        expect(doc.someIncrementedField).toBe(20);
        expect(doc._id).toBe(1n);
      }

      // test add another 1
      {
        const doc = await SomeModel.create({ someIncrementedField: 30 });
        expect(doc.someIncrementedField).toBe(30);
        expect(doc._id).toBe(2n);

        await doc.save();
        expect(doc.someIncrementedField).toBe(30);
        expect(doc._id).toBe(2n);
      }

      const trackerModel = mongoose.connection.models['identitycounter'];
      expect(Object.getPrototypeOf(trackerModel)).toStrictEqual(mongoose.Model);

      const foundTracker = await trackerModel.findOne({ modelName: 'AutoIncrementID-SomeClass-BigInt' }).orFail();
      expect(foundTracker.count).toEqual(2n);
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
      expect(foundTracker.count).toEqual(2n);
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
      expect(foundTracker.count).toEqual(0n);
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
      expect(foundTracker.count).toEqual(0n);
    });

    it('should support skipping with symbol', async () => {
      const schema = new mongoose.Schema({
        _id: Number,
        somefield: Number,
      });
      schema.plugin(AutoIncrementID, {});
      const model = mongoose.model('AutoIncrementID-SomeModel-skiptest', schema);

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
        // skip only works with the current document, not globally, so ".create" will not work
        // because using model.create({ _id: 300, somefield: 20, [AutoIncrementIDSkipSymbol]: true })
        // does not transfer symbols
        const doc = new model({ _id: 300, somefield: 20 });
        doc[AutoIncrementIDSkipSymbol] = true;
        await doc.save();
        expect(doc.somefield).toBe(20);
        expect(doc._id).toBe(300);

        await doc.save();
        expect(doc.somefield).toBe(20);
        expect(doc._id).toBe(300);
      }

      // test add another 1
      {
        const doc = await model.create({ somefield: 30 });
        expect(doc.somefield).toBe(30);
        expect(doc._id).toBe(1);

        await doc.save();
        expect(doc.somefield).toBe(30);
        expect(doc._id).toBe(1);
      }

      const trackerModel = mongoose.connection.models['identitycounter'];
      expect(Object.getPrototypeOf(trackerModel)).toStrictEqual(mongoose.Model);

      const foundTracker = await trackerModel.findOne({ modelName: model.modelName }).orFail();
      expect(foundTracker.count).toEqual(1n);
    });

    it('should support skipping with symbol on the connection', async () => {
      const schema = new mongoose.Schema({
        _id: Number,
        somefield: Number,
      });
      schema.plugin(AutoIncrementID, {});
      const model = mongoose.model('AutoIncrementID-SomeModel-skiptest-connection', schema);

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
        model.db[AutoIncrementIDSkipSymbol] = true;
        const doc = await model.create({ _id: 300, somefield: 20 });
        // IMPORTANT: this has to be unset again so that the next ones are not also affected
        delete model.db[AutoIncrementIDSkipSymbol];
        expect(doc.somefield).toBe(20);
        expect(doc._id).toBe(300);

        await doc.save();
        expect(doc.somefield).toBe(20);
        expect(doc._id).toBe(300);
      }

      // test add another 1
      {
        const doc = await model.create({ somefield: 30 });
        expect(doc.somefield).toBe(30);
        expect(doc._id).toBe(1);

        await doc.save();
        expect(doc.somefield).toBe(30);
        expect(doc._id).toBe(1);
      }

      const trackerModel = mongoose.connection.models['identitycounter'];
      expect(Object.getPrototypeOf(trackerModel)).toStrictEqual(mongoose.Model);

      const foundTracker = await trackerModel.findOne({ modelName: model.modelName }).orFail();
      expect(foundTracker.count).toEqual(1n);
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

    it('should Error if the schema field is not an number', () => {
      const schema = new mongoose.Schema({
        nonNumberField: String,
      });
      expect(() => schema.plugin(AutoIncrementID, { field: 'nonNumberField' })).toThrowErrorMatchingSnapshot();
    });
  });
});
