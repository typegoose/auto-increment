import * as mongoose from 'mongoose';
import { isNullOrUndefined } from 'util';
import { logger } from './logSettings';
import { AutoIncrementOptions } from './types';

const DEFAULT_INCREMENT = 1;

/**
 * The Plugin
 * @param schema The Schema
 * @param options The Options
 */
export function AutoIncrement(schema: mongoose.Schema<any>, options: AutoIncrementOptions[] | AutoIncrementOptions): void {
  // convert normal object into an array
  const fields: AutoIncrementOptions[] = Array.isArray(options) ? options : [options];
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
  schema.pre('save', function AutoIncrementPreSave() { // to have an name to the function if debugging
    if (!this.isNew) {
      logger.info('Starting to increment "%s"', this.modelName);
      for (const field of fields) {
        logger.info('Incrementing "%s" by %d', field.field, field.incrementBy);
        this[field.field] += field.incrementBy;
      }
    }
  });
}
