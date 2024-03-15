import mongoose, { Document, Model, models, Schema } from "mongoose";

export const measurementsNames = [
  "temperatureInPrague",
  "smartStripCurrent",
  "smartStripVoltage"
];

export type MeasurementType = (typeof measurementsNames)[number];

export interface IMeasurement extends Document {
  value: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

type DataModel = Model<IMeasurement>;

const DataSchema = new Schema<IMeasurement>(
  {
    value: Number,
    timestamp: Date,
    metadata: Object
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "metadata",
      granularity: "seconds"
    },
    autoCreate: false
  }
);

export const Measurements: Record<MeasurementType, DataModel> = {};

measurementsNames.forEach((measurement) => {
  Measurements[measurement] =
    models[measurement] || mongoose.model(measurement, DataSchema);
});

export default Measurements;
