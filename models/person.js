const mongoose = require("mongoose");
const url = process.env.MONGODB || process.argv[2];

mongoose.set("strictQuery", false);

console.log("connecting to", url);
mongoose
  .connect(url)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: { type: String, minlength: 5, required: true },
  number: {
    type: String,
    validate: {
      validator: function (str) {
        if (!str.includes("-")) return false;
        const result = str.split("-");
        if (result.length > 2) return false;
        if (!result.map((num) => typeof Number(num) === Number)) return false;
        if (result[0].length < 2 || result[0].length > 3) return false;

        return true;
      },
      message: (props) => `${props.value} is not a valid number`,
    },
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
