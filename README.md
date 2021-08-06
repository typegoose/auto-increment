# Typegoose Automatic Increment

[![Build Status](https://github.com/typegoose/auto-increment/actions/workflows/tests.yml/badge.svg)](https://github.com/typegoose/auto-increment/actions/workflows/tests.yml)
[![Coverage Status](https://coveralls.io/repos/github/typegoose/auto-increment/badge.svg?branch=master#feb282019)](https://coveralls.io/github/typegoose/auto-increment?branch=master)
[![npm](https://img.shields.io/npm/dt/@typegoose/auto-increment.svg)](https://www.npmjs.com/package/@typegoose/auto-increment)

Automaticly Increment properties

## Basic Usage

### Simple

(mongoose)

```ts
const schema = new mongoose.Schema({
  somefield: Number
});
schema.plugin(AutoIncrementSimple, [{ field: 'somefield' }]);
const model = mongoose.model('SomeModel', schema);

const doc = await model.create({ somefield: 10 });

await doc.save(); // somefield will be 11
```

(typegoose)

```ts
@plugin(AutoIncrementSimple, [{ field: "someIncrementedField" }])
class SomeClass {
  @prop() // does not need to be empty
  public someIncrementedField: number;
}

const SomeModel = getModelForClass(SomeClass);

const doc = await SomeModel.create({ someIncrementedField: 10 });

await doc.save(); // someIncrementedField will be 11
```

### For Identification

```ts
const schema = new mongoose.Schema({
  _id: Number,
  somefield: Number
});
schema.plugin(AutoIncrementID, {});
const model = mongoose.model('SomeModel', schema);

const doc = await model.create({ somefield: 10 }); // _id will be 1
```

(typegoose)

```ts
@plugin(AutoIncrementID, {})
class SomeClass {
  @prop()
  public _id: number;

  @prop() // does not need to be empty
  public someIncrementedField: number;
}

const SomeModel = getModelForClass(SomeClass);

const doc = await SomeModel.create({ someIncrementedField: 10 }); // _id will be 1
```

## Motivation

I started `@typegoose/auto-increment` because `mongoose-auto-increment` and `mongoose-auto-increment-reworked` are archived and didnt get any update for at least 2 years, and there were many issues about them in [typegoose](https://github.com/typegoose/typegoose) so i thought it will be easy to make an up-to-date automatic incrementing plugin

## Requirements

- Node 12.22.0+
- TypeScript 4.0+ (older versions could work, but are not tested)
- mongoose 5.13+

## Install

`npm i -s @typegoose/auto-increment`

You also need to install `mongoose`, because this plugin is made for `mongoose`

## Testing

`npm run test` / `npm run test:watch`

## Versioning

`Major.Minor.Fix` (or how npm expresses it `Major.Minor.Patch`)  
(This Project should comply with [Semver](https://semver.org))

## Join Our Discord Server

To ask questions or just talk with us [join our Discord Server](https://discord.gg/BpGjTTD)

## Documentation

### AutoIncrementSimple - Options

The options can either be an object or an array of objects (single field / multiple fields)

Note: This function will only increment if the document is not new, this is to apply the default value

#### field

`string`

This option is always required to get which field to increment

#### incrementBy

`number` default `1`

This option is optional, default is to increment by `1`

### AutoIncrementID - Options

The options can only be one single object

This plugin variant uses a model and a collection to store tracking(/counter) infomation to keep track of the ID in case the latest one gets deleted

Note: the model used to keep track of the counter, will use the connection that the assigned schema uses
Note: when the model is completly new, the first document will be "1", [see here as on why](https://github.com/Automattic/mongoose/issues/3617)

if the hook should be skipped, use `AutoIncrementIDSkipSymbol`

```ts
const doc = new Model();

doc[AutoIncrementIDSkipSymbol] = true;
await doc.save();
```

Note: `AutoIncrementIDSkipSymbol` can also be set inside hooks, but hooks might be called before others

#### incrementBy

`number` default `1`

This option is optional, default is to increment by `1`

#### field

`string`

This option is optional, defaults to `_id`

#### trackerCollection

`string`

Set the Collection the tracker should use to store tracking infomation

This option is optional, defaults to `identitycounters`

#### trackerModelName

`string`

Set the ModelName to use for the tracker model

This option is optional, defaults to `identitycounter`

#### startAt

`number` default `0`

Set the starting number of the counter
(the first document will be this number)

## Notes

* Please dont add comments with `+1` or something like that, use the Reactions
* `npm run doc` generates all documentation for all files that can be used as modules (is used for github-pages)
* `npm run doc:all` generates documentation even for internal modules
