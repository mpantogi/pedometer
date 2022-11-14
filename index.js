const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const Step = require("./database/models/Step");
const sequelize = require("./database");
const { Op } = require("sequelize");
const moment = require("moment");
const { getWeatherData } = require("./services/weather");

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/public", express.static(path.join(__dirname, "./public")));

app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/analysis", (req, res) => {
  res.render("pages/analysis");
});

/**
 * body:
 * date: Date,
 * steps: number
 */

app.post("/api/add-step", async (req, res) => {
  const { date, steps } = req.body;

  const isFilled = await Step.findOne({
    where: {
      date: {
        [Op.eq]: moment(date),
      },
    },
  });
  if (isFilled) {
    return res.status(400).json({
      isSuccess: false,
      payload: "This day have already been inputed steps",
    });
  }

  if (Number(steps) > 50000) {
    return res.status(400).json({
      isSuccess: false,
      payload: "The steps number must be an integer from 1 - 50000",
    });
  }
  const step = await Step.create({
    steps: Number(steps),
    date,
  });
  res.json({
    isSuccess: true,
    payload: step,
  });
});

/**
 *
 * body:
 * startDate: Date,
 * endDate: Date
 */

app.post("/api/analysis", async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const steps = await Step.findAll({
      where: {
        date: {
          [Op.between]: [moment(startDate), moment(endDate)],
        },
      },
      order: [["date", "ASC"]],
    });
    const weather = await getWeatherData(
      `Thermi Thessalonikis`,
      startDate,
      endDate
    );
    res.json({
      isSuccess: true,
      payload: {
        steps,
        weather: weather.filter((day) => {
          const isRecorded = steps.find((step) => {
            return moment(step.date).format("YYYY-MM-DD") == day.datetime;
          });
          return isRecorded;
        }),
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      isSuccess: false,
      payload: err.toString(),
    });
  }
});

sequelize
  .sync({
    alter: true,
  })
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("application started");
    });
  });
