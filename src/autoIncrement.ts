import { merge } from 'lodash';
import * as mongoose from 'mongoose';
import { isNullOrUndefined } from 'util';
import { logger } from './logSettings';
import { AutoIncrementIDTrackerSpec, AutoIncrementOptionsID, AutoIncrementOptionsSimple } from './types';

const DEFAULT_INCREMENT = 1;

/**
 * The Plugin - Simple version
 * Increments an value each time it is saved
 * @param schema The Schema
 * @param options The Options
 */
export function AutoIncrementSimple(
  schema: mongoose.Schema<any>,
  options: AutoIncrementOptionsSimple[] | AutoIncrementOptionsSimple
): void {
  // convert normal object into an array
  const fields: AutoIncrementOptionsSimple[] = Array.isArray(options) ? options : [options];
  logger.info('Initilaize AutoIncrement for an schema with %d fields to increment', fields.length);

  if (fields.length <= 0) {
    throw new Error('Options with at least one field are required!');
  }

  // check if all fields are valid
  for (const field of fields) {
    const schemaField = schema.path(field.field);
    // check if the field is even existing
    if (isNullOrUndefined(schemaField)) {
      throw new Error(`Field "${field.field}" does not exists on the Schema!`);
    }
    // check if the field is an number
    if (!(schemaField instanceof mongoose.Schema.Types.Number)) {
      throw new Error(`Field "${field.field}" is not an SchemaNumber!`);
    }

    if (isNullOrUndefined(field.incrementBy)) {
      logger.info('Field "%s" does not have an incrementBy defined, defaulting to %d', field.field, DEFAULT_INCREMENT);
      field.incrementBy = DEFAULT_INCREMENT;
    }
  }
  schema.pre('save', function AutoIncrementPreSaveSimple() { // to have an name to the function if debugging
    if (!this.isNew) {
      logger.info('Starting to increment "%s"', this.modelName);
      for (const field of fields) {
        logger.info('Incrementing "%s" by %d', field.field, field.incrementBy);
        this[field.field] += field.incrementBy;
      }
    }
  });
}

/** The Schema used for the trackers */
const IDSchema = new mongoose.Schema({
  f: String,
  m: String,
  c: Number
}, { versionKey: false });
IDSchema.index({ f: 1, m: 1 }, { unique: true });

/**
 * The Plugin - ID
 * Increments an counter in an tracking collection
 * @param schema The Schema
 * @param options The Options
 */
export function AutoIncrementID(schema: mongoose.Schema<any>, options: AutoIncrementOptionsID): void {
  /** The Options with default options applied */
  const opt: Required<AutoIncrementOptionsID> = merge({}, {
    field: '_id',
    incrementBy: DEFAULT_INCREMENT,
    trackerCollection: 'idtracker',
    trackerModelName: 'idtracker'
  } as Required<AutoIncrementOptionsID>, options) as Required<AutoIncrementOptionsID>;

  // check if the field is an number
  if (!(schema.path(opt.field) instanceof mongoose.Schema.Types.Number)) {
    throw new Error(`Field "${opt.field}" is not an SchemaNumber!`);
  }

  let model: mongoose.Model<mongoose.Document & AutoIncrementIDTrackerSpec>;

  logger.info('AutoIncrementID called with options %O', opt);

  schema.pre('save', async function AutoIncrementPreSaveID(): Promise<void> {
    logger.info('AutoIncrementID PreSave');
    if (!this.isNew) {
      logger.info('Document is not new, not incrementing');

      return;
    }

    if (!model) {
      logger.info('Creating idtracker model named "%s"', opt.trackerModelName);
      model = this.db.model(opt.trackerModelName, IDSchema, opt.trackerCollection);
    }

    // TODO:
    const { c: count }: { c: number; } = await model.findOneAndUpdate({
      f: opt.field,
      m: (this.constructor as any).modelName
    } as AutoIncrementIDTrackerSpec, {
      $inc: { c: opt.incrementBy }
    }, {
      new: true,
      fields: { c: 1, _id: 0 },
      upsert: true,
      setDefaultsOnInsert: true
    }).lean().exec();

    logger.info('Setting "%s" to "%d"', opt.field, count);
    this[opt.field] = count;

    return;
  });
}

export * from './types';
