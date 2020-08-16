// How big do we make the scatter plot
var Scatter_Width = 960;
var Scatter_Height = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = Scatter_Width - margin.left - margin.right;
var height = Scatter_Height - margin.top - margin.bottom;

// Creation of svg for scatter of the data
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", Scatter_Width)
  .attr("height", Scatter_Height);

var Scatter_Charting = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var X_Axis_Select = "age";
var Y_Axis_Select = "healthcare";

// Functions for scale updating
function xScale(Data_For_States, X_Axis_Select) {
  
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Data_For_States, d => d[X_Axis_Select]) * 0.9,
      d3.max(Data_For_States, d => d[X_Axis_Select]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(Data_For_States, Y_Axis_Select) {
  
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(Data_For_States, d =>d[Y_Axis_Select]) * 0.9,
      d3.max(Data_For_States, d => d[Y_Axis_Select]) * 1.1
    ])
    .range([height, 0]);

  return yLinearScale;
}

// click functions for updating axis
function renderAxes(X_Scale_Adjust, xAxis) {
  var bottomAxis = d3.axisBottom(X_Scale_Adjust);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxis(Y_Scale_Adjust, yAxis) {
  var leftAxis = d3.axisLeft(Y_Scale_Adjust);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, circleText, X_Scale_Adjust, X_Axis_Select, Y_Scale_Adjust, Y_Axis_Select) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => X_Scale_Adjust(d[X_Axis_Select]))
    .attr("cy", d => Y_Scale_Adjust(d[Y_Axis_Select]));
  circleText.transition()
    .duration(1000)
    .attr("x", d => X_Scale_Adjust(d[X_Axis_Select]))
    .attr("y", d => Y_Scale_Adjust(d[Y_Axis_Select]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(X_Axis_Select, Y_Axis_Select, circlesGroup) {

  if (X_Axis_Select === "age") {
    var label = "Avg Age:";
  }
  else if (X_Axis_Select === "poverty") {
    var label = "% Pov.:"
  }
  else {
    var label = "Avg Inc.:";
  }
  if (Y_Axis_Select === "healthcare") {
    var yLabel = "No Care:";
  }
  else if (Y_Axis_Select === "smokes") {
    var yLabel = "% Smoker:";
  }
  else {
    var yLabel = "% Obese:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[X_Axis_Select]}<br>${yLabel} ${d[Y_Axis_Select]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", toolTip.show)
    // onmouseout event
    .on("mouseout", toolTip.hide);

  return circlesGroup;
}

// Pull CSV file and parse
d3.csv("assets/data/data.csv").then(function(Data_For_States) {

  Data_For_States.forEach(function(data) {
    data.id = +data.id;
    data.state = data.state;
    data.abbr = data.abbr;
    data.poverty = +data.poverty;
    data.povertyMoe = +data.povertyMoe;
    data.age = +data.age;
    data.ageMoe = +data.ageMoe;
    data.income = +data.income;
    data.incomeMoe = +data.incomeMoe;
    data.healthcare = +data.healthcare;
    data.healthcareLow = +data.healthcareLow;
    data.healthcareHigh = +data.healthcareHigh;
    data.obesity = +data.obesity;
    data.obesityLow = +data.obesityLow;
    data.obesityHigh = +data.obesityHigh;
    data.smokes = +data.smokes;
    data.smokesLow = +data.smokesLow;
    data.smokesHigh = +data.smokesHigh;
  });
  

  // xLinearScale function above csv import
  var xLinearScale = xScale(Data_For_States, X_Axis_Select);

  // Create y scale function
  var yLinearScale = yScale(Data_For_States, Y_Axis_Select);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = Scatter_Charting.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = Scatter_Charting.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  var circleTextGroup = Scatter_Charting.append("g");

  // Making the circles 
  var circlesGroup = circleTextGroup.selectAll("circle")
    .data(Data_For_States)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[X_Axis_Select]))
    .attr("cy", d => yLinearScale(d[Y_Axis_Select]))
    .attr("r", 12)
    .attr("fill", "darkblue")
    .attr("opacity", ".9");

  var circleText = circleTextGroup.selectAll("text")
    .data(Data_For_States)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[X_Axis_Select]))
    .attr("y", d => yLinearScale(d[Y_Axis_Select]))
    .text(d => d.abbr)
    .attr("font-size", "12px")
    .attr("stroke", "white")
    .attr("text-anchor", "middle");

  // Create group for  2 x- axis labels
  var X_Labels = Scatter_Charting.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var Label_4_AvgAge = X_Labels.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") 
    .classed("active", true)
    .text("Average Age");

  var Label_4_Poverty = X_Labels.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty")
    .classed("inactive", true)
    .text("Percent In Poverty");

  var Label_4_AvgIncome = X_Labels.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Average Income");

  // Create group for  2 y- axis labels
  var Y_Labels = Scatter_Charting.append("g")
  .attr("transform", `translate(${width / 2}, ${height})`)
  .attr("transform", "rotate(-90)");

  var Label_4_Healthcare = Y_Labels.append("text")
    .attr("y", 0 - (0.5 * margin.left))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Percent No Healthcare");

  var Label_4_Smoker = Y_Labels.append("text")
    .attr("y", 0 - (0.75 * margin.left))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Percent Smoker");

  var Label_4_Obese = Y_Labels.append("text")
    .attr("y", 0 - (1.00 * margin.left))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Percent Obese");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(X_Axis_Select, Y_Axis_Select, circlesGroup);

  // X updating values
  X_Labels.selectAll("text")
    .on("click", function() {
      
      var value = d3.select(this).attr("value");
      if (value !== X_Axis_Select) {

        X_Axis_Select = value;

        xLinearScale = xScale(Data_For_States, X_Axis_Select);

        xAxis = renderAxes(xLinearScale, xAxis);

        circlesGroup = renderCircles(circlesGroup, circleText, xLinearScale, X_Axis_Select, yLinearScale, Y_Axis_Select);

        circlesGroup = updateToolTip(X_Axis_Select, Y_Axis_Select, circlesGroup);

        // Changing text dependent on what was selected poverty, age, else income
        if (X_Axis_Select === "poverty") {
          Label_4_Poverty
            .classed("active", true)
            .classed("inactive", false);
          Label_4_AvgAge
            .classed("active", false)
            .classed("inactive", true);
          Label_4_AvgIncome
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (X_Axis_Select === "age") {
          Label_4_Poverty
            .classed("active", false)
            .classed("inactive", true);
          Label_4_AvgAge
            .classed("active", true)
            .classed("inactive", false);
          Label_4_AvgIncome
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          Label_4_Poverty
            .classed("active", false)
            .classed("inactive", true);
          Label_4_AvgAge
            .classed("active", false)
            .classed("inactive", true);
          Label_4_AvgIncome
            .classed("active", true)
            .classed("inactive", false);

        }
      }
    });

  // y updating values
  Y_Labels.selectAll("text")
    .on("click", function() {
      
      var value = d3.select(this).attr("value");
      if (value !== Y_Axis_Select) {

        Y_Axis_Select = value;

        yLinearScale = yScale(Data_For_States, Y_Axis_Select);

        yAxis = renderYAxis(yLinearScale, yAxis);

        circlesGroup = renderCircles(circlesGroup, circleText, xLinearScale, X_Axis_Select, yLinearScale, Y_Axis_Select);

        circlesGroup = updateToolTip(X_Axis_Select, Y_Axis_Select, circlesGroup);

        // Changing text dependent on what was selected healthcare, smokes, else obese
        if (Y_Axis_Select === "healthcare") {
          Label_4_Healthcare
            .classed("active", true)
            .classed("inactive", false);
          Label_4_Smoker
            .classed("active", false)
            .classed("inactive", true);
          Label_4_Obese
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (Y_Axis_Select === "smokes") {
          Label_4_Healthcare
            .classed("active", false)
            .classed("inactive", true);
          Label_4_Smoker
            .classed("active", true)
            .classed("inactive", false);
          Label_4_Obese
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          Label_4_Healthcare
            .classed("active", false)
            .classed("inactive", true);
          Label_4_Smoker
            .classed("active", false)
            .classed("inactive", true);
          Label_4_Obese
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});
