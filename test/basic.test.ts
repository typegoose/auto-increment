import { getModelForClass, modelOptions, plugin, prop } from '@typegoose/typegoose';
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

      const doc: mongoose.Document & { somefield: number } = (await model.create({ somefield: 10 })) as any;
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

      const doc: mongoose.Document & { somefield: number } = (await model.create({ somefield: 10 })) as any;
      expect(doc.somefield).toBe(10);
      expect(doc._id).toBe(0);

      await doc.save();
      expect(doc.somefield).toBe(10);
      expect(doc._id).toBe(0);

      expect(mongoose.connection.model('identitycounter')).not.toBeUndefined();
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

      const doc = await SomeModel.create({ someIncrementedField: 10 });
      expect(doc.someIncrementedField).toBe(10);
      expect(doc._id).toBe(0);

      await doc.save();
      expect(doc.someIncrementedField).toBe(10);
      expect(doc._id).toBe(0);

      expect(mongoose.connection.model('identitycounter')).not.toBeUndefined();
    });

    it('Basic Function Mongoose With startAt', async () => {
      const schema = new mongoose.Schema({
        _id: Number,
        somefield: Number,
      });
      schema.plugin(AutoIncrementID, { startAt: 2 });
      const model = mongoose.model('AutoIncrementID-SomeModelStartAt', schema);

      const doc: mongoose.Document & { somefield: number } = (await model.create({ somefield: 10 })) as any;
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
  });
});

describe('Errors', () => {
  it('should Error if the schema path does not exist', () => {
    const schema = new mongoose.Schema({});
    expect(() => schema.plugin(AutoIncrementSimple, { field: 'SomeNonExistingField' })).toThrow(Error);
  });

  it('should Error if the schema path is not an number', () => {
    const schema = new mongoose.Schema({
      nonNumberField: String,
    });
    expect(() => schema.plugin(AutoIncrementSimple, { field: 'nonNumberField' })).toThrow(Error);
  });
});
