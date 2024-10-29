const mongoose = require("mongoose");
const { schema } = require("./user.model");
const Schema = mongoose.Schema;

const travelPlanSchema = new Schema({
    title: {type: String, required: true},
    plan: {type: String, required: true},
    plannedLocation: {type: [String], default: []},
    isFavorite: {type: Boolean, default: false},
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true},
    createdOn: {type: Date, default: Date.now},
    imageUrl: {type: String, required: true},
    plannedDate: {type: Date, required: true},
});

module.exports = mongoose.model("TravelPlan", travelPlanSchema);