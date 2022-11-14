const { DataTypes } = require("sequelize");
const sequelize = require("../index");

const Step = sequelize.define("Step", {
  steps: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});
module.exports = Step;
