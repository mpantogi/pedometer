window.addEventListener("load", () => {
  const inputForm = document.querySelector("form");

  if (inputForm) {
    inputForm.addEventListener("submit", () => {
      const date = document.getElementById("date").value;
      const steps = document.getElementById("steps").value;
      fetch("/api/add-step", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          steps,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (!res.isSuccess) {
            alert(res.payload);
          } else {
            alert("add step successfully");
          }
        });
    });
  }

  $('input[name="daterange"]').daterangepicker({
    opens: "left",
  });
  var chart;

  const inspectBtn = document.getElementById("inspect");
  if (inspectBtn) {
    inspectBtn.addEventListener("click", () => {
      if (chart) {
        chart.destroy();
      }
      const [start, end] = document
        .querySelector('input[name="daterange"]')
        .value.split(" - ");

      fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: moment(start, "MM-DD-YYYY").format("YYYY-MM-DD"),
          endDate: moment(end, "MM-DD-YYYY").format("YYYY-MM-DD"),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const ctx = document.getElementById("barchart").getContext("2d");
          chart = new Chart(ctx, {
            type: "bar",
            data: {
              labels: data.payload.steps.map((step) => {
                return moment(step.date).format("DD-MM-YYYY");
              }),
              datasets: [
                {
                  label: "Steps",
                  data: data.payload.steps.map((step) => step.steps),
                  backgroundColor: ["rgba(75, 192, 192, 0.2)"],
                  borderColor: ["rgb(75, 192, 192)"],
                  borderWidth: 1,
                },
              ],
            },
          });

          const weather = document.querySelector(".weather");
          weather.innerHTML = `<table class="table">
          <thead>
            <tr>
           
              <th scope="col">Date</th>
              <th scope="col">temperature</th>
              <th scope="col">humidity</th>
            </tr>
          </thead>
          <tbody>
          ${data.payload.weather
            .map(
              (day) =>
                `
        <tr>
            <td>${day.datetime}</td>
            <td>${day.temp}°F</td>
            <td>${day.humidity}</td>
          </tr>
            `
            )
            .join("")}
           
           
          </tbody>
        </table>`;
        })
        .catch(() => {
          alert("something went wrong, please check the API KEY");
        });
    });
  }
});
