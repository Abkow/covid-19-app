$(document).ready(function () {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let data = load_data();
  let last_date = available_month(data);
  let coutries = collect_countries(data);

  $("#last_date").text(format_date(last_date));

  //   assign data to html elements
  $("#total_confirmed").text(format_number(last_total_confirmed(data)));
  $("#confirmed").text(format_number(last_total_confirmed(data)));
  $("#recover").text(format_number(last_total_recovered(data)));
  $("#death").text(format_number(last_total_death(data)));

  // print all coutries and their cases
  print_last_update(data).forEach((country) => {
    $("#countries_confirmed").append(`
            <li>
                <span class="country"> ${Object.keys(country)}</span>
                <span class="number">(${format_number(
                  country[Object.keys(country)].confirmed
                )})</span>
            </li>
        `);
  });

  $("#search_country").keyup(function (e) {
    let found = search_country(coutries, $(this).val());
    $(".guest").children().remove();
    found.forEach((country) => {
      $(".guest").append(`<li onclick="select_country()">${country}</li>`);
    });

    $(".guest li").click(function () {
      $("#search_country").val($(this).text());
      $(".guest").children().remove();
    });
  });

  $(".search_img").click(function () {
    let input = "";
    try {
      input = $("#search_country").val().trim();
    } catch (error) {
      input = $("#search_country").val();
    }
    if (input != "" && $("#months").val() != null) {
      let select_month = Number($("#months").val());
      let date = last_date.split("-");
      date = date[0] + "-" + (select_month + 1) + "-" + date[2];
      let country = colllect_selected_data(data, input, date);
      $("#confirmed").text(format_number(country.confirmed));
      $("#recover").text(format_number(country.recovered));
      $("#death").text(format_number(country.deaths));
      $("#by_country").text("#" + input);
    } else if (input != "") {
      let country = colllect_selected_data(data, input);
      country = country[Object.keys(country)];
      $("#confirmed").text(format_number(country.confirmed));
      $("#recover").text(format_number(country.recovered));
      $("#death").text(format_number(country.deaths));
      $("#by_country").text("#" + input);
    }
  });

  //   find_country(data, "somalia", "2020-3-28");

  // loads all date from github govid-19 url
  function load_data() {
    let data = null;
    $.ajax({
      type: "GET",
      url: "https://pomber.github.io/covid19/timeseries.json",
      dataType: "JSON",
      async: false,
      success: function (response) {
        data = response;
      },
    });

    return data;
  }

  // formats data to json
  function format_to_json(data) {
    let json = [];
    object = Object.entries(data);
    object.forEach((country) => {
      let data = {};
      data[country[0]] = country[1];
      json.push(data);
    });
    return json;
  }

  // print last update
  function print_last_update(data) {
    let json = [];
    object = Object.entries(data);

    for (let i = 0; i < object.length; i++) {
      let data = object[i][1];
      let obj = {};
      obj[object[i][0]] = {
        date: data[data.length - 1].date,
        confirmed: data[data.length - 1].confirmed,
        deaths: data[data.length - 1].deaths,
        recovered: data[data.length - 1].recovered,
      };
      json.push(obj);
    }

    return json;
  }

  // print last confirmed
  function last_total_confirmed(data) {
    let totalConfirmed = 0;
    let countries = print_last_update(data);
    countries.forEach((country) => {
      totalConfirmed += country[Object.keys(country)].confirmed;
    });
    return totalConfirmed;
  }

  // print last recovered
  function last_total_recovered(data) {
    let totalRecovered = 0;
    let countries = print_last_update(data);
    countries.forEach((country) => {
      totalRecovered += country[Object.keys(country)].recovered;
    });
    return totalRecovered;
  }

  // print last death
  function last_total_death(data) {
    let totalDeaths = 0;
    let countries = print_last_update(data);
    countries.forEach((country) => {
      totalDeaths += country[Object.keys(country)].deaths;
    });
    return totalDeaths;
  }

  // put comma in to numbers where is requiered
  function format_number(number) {
    x = number.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
    return x;
  }

  // collect countries
  function collect_countries(data) {
    let countries_arr = [];
    let countries = print_last_update(data);
    countries.forEach((country) => {
      countries_arr.push(Object.keys(country)[0]);
    });
    return countries_arr;
  }

  // search countries
  function search_country(coutries, country) {
    let found = [];
    let str = "";
    if (country.trim() == "") {
      return [];
    }
    for (let i = 0; i < coutries.length; i++) {
      let value = coutries[i];
      if (country.toLowerCase().trim() == value.toLowerCase().trim()) {
        found.push(value);
        str = "";
        continue;
      }
      for (let y = 0; y < value.length; y++) {
        if (country.toLowerCase() == str.toLowerCase()) {
          found.push(value);
          str = "";
          break;
        }
        str += value[y];
      }
      str = "";
    }
    return found;
  }

  function colllect_selected_data(
    data,
    select_country = null,
    select_month = null
  ) {
    if (select_country != null && select_month != null) {
      let return_data = null;
      data = format_to_json(data);

      data.forEach((country) => {
        if (select_country.trim() == [Object.keys(country)][0][0]) {
          let loops = country[Object.keys(country)];
          for (let i = 0; i < loops.length; i++) {
            if (country[Object.keys(country)][i].date == select_month) {
              return_data = country[Object.keys(country)][i];
              break;
            }
          }
        }
      });
      return return_data;
    } else if (select_country != null) {
      data = print_last_update(data);
      let country = data.filter(function (country) {
        if (
          Object.keys(country)[0].toLowerCase() == select_country.toLowerCase()
        ) {
          return country;
        }
      });
      return country[0];
    }
  }

  // prints available months
  function available_month(data) {
    let date = 0;
    let countries = print_last_update(data);
    for (let i = 0; i < countries.length; i++) {
      date = countries[i][Object.keys(countries[i])[0]].date;
      break;
    }
    let iteration = date.split("-")[1];
    for (let i = 0; i < iteration; i++) {
      $("#months").append(
        `<option value="${i}">${months[i]} - ${date.split("-")[0]}</option>`
      );
    }
    return date;
  }

  function format_date(date) {
    date = date.split("-");
    return `${date[2]}-${date[1]}-${date[0]}`;
  }
});
