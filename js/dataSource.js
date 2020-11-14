const HAPPINESS = [
    ["Economy", "Economy", [
        "NY.GDP.PCAP.KD", 
        "SI.POV.GINI", 
        "EG.USE.PCAP.KG.OE", 
        "SL.UEM.TOTL.FE.NE.ZS", 
        "SL.UEM.TOTL.MA.NE.ZS"
    ], "NY.GDP.PCAP.KD", [], "#ebc700"], 
    ["Family", "Society", [
        "per_si_allsi.adq_pop_tot", 
        "per_allsp.adq_pop_tot", 
        "per_sa_allsa.adq_pop_tot", 
        "per_lm_alllm.adq_pop_tot",
        "GC.XPN.TRFT.ZS",
        "SH.STA.SUIC.P5",
        "SH.STA.SUIC.FE.P5",
        "SH.STA.SUIC.MA.P5",
        "IC.LGL.CRED.XQ"
    ], "per_allsp.adq_pop_tot", [], "#ff6bb3"], 
    ["Health", "Health", [
        "SP.DYN.LE00.IN", 
        "SP.DYN.LE00.FE.IN", 
        "SP.DYN.LE00.MA.IN", 
        "SL.UEM.TOTL.NE.ZS",
        "SH.STA.AIRP.P5",
        "SH.STA.POIS.P5",
        "SH.XPD.CHEX.PC.CD"
    ], "SP.DYN.LE00.IN", [], "#2abf3b"], 
    ["Freedom", "Freedom", [
        "hf_score", 
        "pf_rol", 
        "pf_ss", 
        "pf_movement", 
        "pf_religion", 
        "pf_association", 
        "pf_expression", 
        "pf_identity", 
        "pf_score", 
        "ef_government", 
        "ef_legal", 
        "ef_money", 
        "ef_trade", 
        "ef_regulation", 
        "ef_score"
    ], "hf_score", [], "#6392ff"], 
    ["Generosity", "Generosity", [
        "World Giving Index"
    ], "World Giving Index", [], "#8f5eff"], 
    ["Trust", "Trust", [
        "Corruption Perceptions Index",
        "IQ.CPA.TRAN.XQ"
    ], "Corruption Perceptions Index", [], "#ff4d36"], 
    ["Residual", "Residual", [], "", [], "#999999"]
];

function ready(data) {
    let selectedYear = 2019;
    
    $("#overlay").hide();
    
    $(".overlay-bg").on("click", function() {
        $(this).parent().hide();
    });
    
    let happinessData = Country.allCountries2.map(function(x) {
        let d1 = data[Country.alpha3(x)];
        d1 = d1 && d1["Happiness"];

        return {
            id: x,
            name: Country.name(x),
            value2015: d1 && d1[2015],
            value2016: d1 && d1[2016],
            value2017: d1 && d1[2017],
            value2018: d1 && d1[2018],
            value2019: d1 && d1[2019]
        };
    });
    
    let l1XAxis = line1.xAxes.push(new am4charts.DateAxis());
    l1XAxis.dateFormats.setKey("year", "yyyy");
    l1XAxis.dataFields.date = "date";
    let l1YAxis = line1.yAxes.push(new am4charts.ValueAxis());
    l1YAxis.max = 10;
    l1YAxis.min = 0;

    function loadYearMap(year) {
        $(".switch-btn", "#map_year").removeClass("default");
        $("#_" + year).addClass("default");
        polygons.data = happinessData.map(x => ({id: x.id, name: x.name, value: x["value" + year]}));
    }

    let radarCatAxis = radar.xAxes.push(new am4charts.CategoryAxis());
    radarCatAxis.dataFields.category = "name";
    radarCatAxis.cursorTooltipEnabled = false;
    let radarValAxis = radar.yAxes.push(new am4charts.ValueAxis());
    radarValAxis.dataFields.data = "value";
    radarValAxis.max = 4;
    radarValAxis.min = 0;
    let radarValues = radar.series.push(new am4charts.RadarSeries());
    radarValues.dataFields.valueY = "value";
    radarValues.dataFields.categoryX = "name";
    radarValues.tooltipText = `{name}: {value}`;
    radarValues.strokeWidth = 3;
    radarValues.strokeOpacity = 0.7;
    radarValues.fillOpacity = 0.4;
    let radarValues2 = radar.series.push(new am4charts.RadarColumnSeries());
    radarValues2.dataFields.valueY = "value";
    radarValues2.dataFields.categoryX = "name";
    radarValues2.fillOpacity = 0;
    radarValues2.strokeWidth = 0;
    let radarValues3 = radar.series.push(new am4charts.RadarSeries());
    radarValues3.dataFields.valueY = "valueCompare";
    radarValues3.dataFields.categoryX = "name";
    radarValues3.tooltipText = `{name}: {valueCompare}`;
    radarValues3.strokeWidth = 3;
    radarValues3.strokeOpacity = 0.7;
    radarValues3.fill = radarValues3.stroke = am4core.color("#990000");
    radarValues3.fillOpacity = 0.4;

    radar.cursor = new am4charts.RadarCursor();
    radar.cursor.maxTooltipDistance = -1;
    
    for (let i of Country.allCountries2) {
        let a = document.createElement("option");
        a.value = i;
        a.innerText = Country.name(i);
        $("#compare").append(a);
    }

    polygons.mapPolygons.template.tooltipText = "{name}: [bold]{value}[/]";
    polygons.mapPolygons.template.events.on("hit", function(ev) {
        let data2 = ev.target.dataItem.dataContext || {};
        if (data2.value) {            
            radar.series.getIndex(0).stroke = radar.series.getIndex(0).fill = ev.target.fill;
            $("#radar_title").html(`${data2.name}: ${data2.value}`);
            $("#radar_overlay").show();
                
            function loadYear(year) {
                let countryData = data[Country.alpha3(data2.id)] || {};
                radar.data = HAPPINESS.map(([key, name]) => ({
                    key,
                    name, 
                    value: countryData[key] && countryData[key][year]
                }));
                
                line1.data = [2015, 2016, 2017, 2018, 2019].map(function(x) {
                    let a = {
                        date: new Date(x, 0),
                        year: x,
                        name,
                        valueHappiness: countryData["Happiness"] && countryData["Happiness"][x]
                    };
                    HAPPINESS.map(([key, name]) => a["value" + key] = countryData[key] && countryData[key][x]);
                    return a;
                });
                
                loadComparison($("#compare").off("change").on("change", function() {
                    loadComparison(this.value);
                }).val("").val());
            }
            loadYear(selectedYear);
            
            
            function loadComparison(b) {
                line1.series.clear();
                
                if (b && happinessData.find(x => x.id == b)["value" + selectedYear]) {
                    let c = data[Country.alpha3(b)] || {};
                    
                    for (let i of radar.data)
                        i.valueCompare = c && c[i.key] && c[i.key][selectedYear];                        
                    for (let i = 0; i < 5; i++)
                        line1.data[i].valueCompare = c && c.Happiness && c.Happiness[2015 + i];
                    
                    radar.data = radar.data;
                    line1.data = line1.data;
                    
                    let valuesH = line1.series.push(new am4charts.LineSeries());
                    valuesH.dataFields.valueY = "valueHappiness";
                    valuesH.dataFields.dateX = "date";   
                    valuesH.tooltipText = `({year}) ${Country.name(data2.id)}: {valueHappiness}`;
                    
                    valuesH.events.on("over", function(ev) {
                        radar.series.getIndex(0).strokeWidth = 5;
                    });
                    valuesH.events.on("out", function(ev) {
                        radar.series.getIndex(0).strokeWidth = 1;
                    });
                    
                    let segmentH = valuesH.segments.template;
                    valuesH.stroke = ev.target.fill;
                    valuesH.strokeWidth = 1;
                    segmentH.interactionsEnabled = true;
                    segmentH.states.create("hover").properties.strokeWidth = 5;
                    
                    valuesH = line1.series.push(new am4charts.LineSeries());
                    valuesH.dataFields.valueY = "valueCompare";
                    valuesH.dataFields.dateX = "date";   
                    valuesH.tooltipText = `({year}) ${Country.name(b)}: {valueCompare}`;
                    
                    valuesH.events.on("over", function(ev) {
                        radar.series.getIndex(2).strokeWidth = 5;
                    });
                    valuesH.events.on("out", function(ev) {
                        radar.series.getIndex(2).strokeWidth = 1;
                    });
                    
                    segmentH = valuesH.segments.template;
                    valuesH.stroke = am4core.color("#990000");
                    valuesH.strokeWidth = 1;
                    segmentH.interactionsEnabled = true;
                    segmentH.states.create("hover").properties.strokeWidth = 5;
                    
                    line1.legend.data = [
                        {name: Country.name(data2.id), fill: ev.target.fill},
                        {name: Country.name(b), fill: am4core.color("#990000")}
                    ];
                }
                else {
                    for (let i of radar.data)
                        delete i.valueCompare;
                    for (let i = 0; i < 5; i++)
                        delete line1.data[i].valueCompare;
                    
                    radar.data = radar.data;
                    line1.data = line1.data;
                    
                    let valuesH = line1.series.push(new am4charts.LineSeries());
                    valuesH.dataFields.valueY = "valueHappiness";
                    valuesH.dataFields.dateX = "date";   
                    valuesH.tooltipText = `({year}) Happiness Index: {valueHappiness}`;
                    
                    valuesH.events.on("over", function(ev) {
                        radar.series.getIndex(0).strokeWidth = 5;
                    });
                    valuesH.events.on("out", function(ev) {
                        radar.series.getIndex(0).strokeWidth = 1;
                    });
                    
                    let segmentH = valuesH.segments.template;
                    valuesH.stroke = ev.target.fill;
                    segmentH.interactionsEnabled = true;
                    segmentH.states.create("hover").properties.strokeWidth = 5;
                    
                    let _k = 0;
                    HAPPINESS.map(([key, name, _, __, ___, color]) => {
                        let values = line1.series.push(new am4charts.LineSeries());
                        values.dataFields.valueY = "value" + key;
                        values.dataFields.dateX = "date";   
                        values.tooltipText = `({year}) ${name}: {value${key}}`;
                        
                        
                        values.events.on("over", (_ => function(ev) {
                            let f = radar.series.getIndex(1)._columns.getIndex(_);
                            f.fill = am4core.color(HAPPINESS[_][5]);
                            f.fillOpacity = 0.5; 
                            f.strokeWidth = 1;    
                        })(_k));
                        values.events.on("out", (_ => function(ev) {
                            let f = radar.series.getIndex(1)._columns.getIndex(_);
                            f.fillOpacity = 0; 
                            f.strokeWidth = 0;               
                        })(_k));
                        
                        let segment = values.segments.template;
                        values.stroke = am4core.color(color);
                        valuesH.strokeWidth = 1;
                        values.tooltip.background.fill = values.stroke;
                        segment.strokeWidth = 1;
                        segment.interactionsEnabled = true;
                        segment.states.create("hover").properties.strokeWidth = 5;
                        
                        _k++;
                    });
                    line1.cursor.maxTooltipDistance = -1;
                    
                    line1.legend.data = [
                        {name: "Happiness", fill: ev.target.fill},
                        ...HAPPINESS.map(x => ({name: x[1], fill: am4core.color(x[5])}))
                    ];
                }
            }
        }
    }, this);
    
    polygons.heatRules.push({
        property: "fill",
        target: polygons.mapPolygons.template,
        min: am4core.color("#2d436b"),
        max: am4core.color("#a3c3ff")
    });

    let legend = map.createChild(am4charts.HeatLegend);
    legend.series = polygons;
    legend.position = "bottom";
    legend.width = am4core.percent(100);
    
    let l2XAxis = line2.xAxes.push(new am4charts.DateAxis());
    l2XAxis.dateFormats.setKey("year", "yyyy");
    l2XAxis.dataFields.date = "date";
    l2XAxis.gridIntervals.setAll([
        {timeUnit: "year", count: 1},
        {timeUnit: "year", count: 5},
        {timeUnit: "year", count: 10}
    ]);
    let l2YAxis = line2.yAxes.push(new am4charts.ValueAxis());
    l2YAxis.min = 0;
    
    let l2Values = line2.series.push(new am4charts.LineSeries());
    l2Values.dataFields.dateX = "date";
    l2Values.dataFields.valueY = "value";
    l2Values.tooltipText = `({year}) {countryName}: {valueY}`;
    l2Values.legendSettings.itemValueText = "{countryName}";
    l2Values.stroke = am4core.color("#75d0e0");
    l2Values.strokeWidth = 1;
    let l2S = l2Values.segments.template;
    l2S.interactionsEnabled = true;
    l2S.states.create("hover").properties.strokeWidth = 5;
    
    l2Values.events.on("over", function(ev) {
        detail.series.getIndex(0)._columns.getIndex(0).strokeWidth = 5;    
    });
    l2Values.events.on("out", function(ev) {
        detail.series.getIndex(0)._columns.getIndex(0).strokeWidth = 1;    
    });
                        
    l2Values = line2.series.push(new am4charts.LineSeries());
    l2Values.dataFields.dateX = "date";
    l2Values.dataFields.valueY = "valueWorld";
    l2Values.tooltipText = `({year}) World: {valueY}`;
    l2Values.legendSettings.itemValueText = "World";
    l2Values.stroke = am4core.color("#4c87cf");
    l2Values.strokeWidth = 1;
    l2S = l2Values.segments.template;
    l2S.interactionsEnabled = true;
    l2S.states.create("hover").properties.strokeWidth = 5;
    
    l2Values.events.on("over", function(ev) {
        detail.series.getIndex(0)._columns.getIndex(1).strokeWidth = 5;    
    });
    l2Values.events.on("out", function(ev) {
        detail.series.getIndex(0)._columns.getIndex(1).strokeWidth = 1;    
    });
    
    line2.legend.data = [
        {name: "", fill: am4core.color("#75d0e0")},
        {name: "World", fill: am4core.color("#4c87cf")},
    ];
    
    let compoCatAxis = compo.yAxes.push(new am4charts.CategoryAxis());
    compoCatAxis.dataFields.category = "name";
    compoCatAxis.tooltipText = "({order}) {name}: {Happiness}";
    compo.xAxes.push(new am4charts.ValueAxis());
    
    let dCatAxis = detail.xAxes.push(new am4charts.CategoryAxis());
    dCatAxis.dataFields.category = "name";
    let dValAxis = detail.yAxes.push(new am4charts.ValueAxis());
    dValAxis.min = 0;
    let dValues = detail.series.push(new am4charts.ColumnSeries());
    dValues.dataFields.categoryX = "name";
    dValues.dataFields.valueY = "value";
    dValues.columns.template.tooltipText = `{categoryX}\n[bold]{valueY}`;
    dValues.tooltip.pointerOrientation = "down";
    dValues.columns.template.propertyFields.fill = "fill";
    dValues.columns.template.propertyFields.stroke = "fill";
    dValues.columns.template.strokeWidth = 1;
    dValues.columns.template.fillOpacity = 0.7;
    
    compo.legend.data = HAPPINESS.map(([key, name, subItems, main, subColor, color]) => {
        let values = compo.series.push(new am4charts.ColumnSeries());
        values.stacked = true;
        values.dataFields.categoryY = "name";
        values.dataFields.valueX = key;
        values.tooltipText = `${name}: {valueX}`;
        values.tooltip.pointerOrientation = "left";
        values.columns.template.fill = am4core.color(color);
        
        values.columns.template.events.on("hit", function(ev) {
            if (subItems.length > 0) {
                $(`#detail_overlay`).show();
                let countryData = data[Country.alpha3(ev.target.dataItem.dataContext.id)] || {};
                let countryName = Country.name(ev.target.dataItem.dataContext.id);
                
                line2.legend.data[0].name = countryName;
                line2.legend.data = line2.legend.data;
                
                /*
                detail.data = [countryName, "World"].map(function(x) {
                    let a = {name: x};
                    let r = x == "World" ? data["WLD"] : countryData;
                    subItems.map(y => a[y] = r[y] && r[y][selectedYear] || undefined);
                    return a;
                });*/
                
                let showScore = ev.target.dataItem.dataContext[key];
                
                $("#indicator").empty();
                subItems.map(function(x) {
                    let a = document.createElement("option");
                    a.value = x;
                    a.innerText = INDICATORS[x];
                    $("#indicator").append(a);
                });
                
                function loadIndicator(indicator) {
                    $("#detail_title").html(
                        `${name} rating for ${countryName}: ${(+showScore).toFixed(3)}${countryData[indicator] && countryData[indicator][selectedYear] ? `
<div class="explained">
    Explained by ${INDICATORS[indicator]} = ${countryData[indicator] && (+countryData[indicator][selectedYear]).toFixed(1)}
</div>`: ""}`
                    );
                    
                    detail.data = [
                        {
                            name: countryName, 
                            value: countryData[indicator] && countryData[indicator][selectedYear] || undefined, 
                            fill: line2.legend.data[0].fill
                        },
                        {
                            name: "World", 
                            value: data["WLD"][indicator] && data["WLD"][indicator][selectedYear] || undefined,
                            fill: line2.legend.data[1].fill
                        }                    
                    ];

                    if (countryData[indicator]) {
                        $("#line2").show();
                        line2.data = Object.keys(countryData[indicator]).sort((a, b) => a - b).map(x => ({
                            date: new Date(+x, 0),
                            year: +x,
                            countryName,
                            value: countryData[indicator] && countryData[indicator][x] || undefined,
                            valueWorld: data["WLD"][indicator] && data["WLD"][indicator][x] || undefined
                        }));
                    }
                    else 
                        $("#line2").hide();
                    
                }
                
                loadIndicator($("#indicator").off("change").on("change", function() {
                    loadIndicator(this.value);
                }).val(main).val());
            }
        });
        return {name, fill: am4core.color(color)};
    });
    
    compo.events.on("datavalidated", function(ev) {
        let height = compo.data.length * 40;
        compo.svgContainer.htmlElement.style.height = (height + 150) + "px";
        compo.yAxes.getIndex(0).height = height;
    });
    
    function setComponentsYear(year) {
        let sort = $("#order").val();
        
        for (let i = 0; i < 7; i++) {
            if (compo.series.getIndex(i).dataFields.valueX == sort) {
                compo.series.moveValue(compo.series.getIndex(i), 0);
                break;
            }
        }
        
        let temp = Country.allCountries2.map(function(x) {
            let d1 = data[Country.alpha3(x)], _d1 = d1;
            d1 = d1 && d1["Happiness"],
            d1 = d1 && d1[year];
            
            if (d1) {
                let result = {
                    id: x,
                    name: Country.name(x),
                    Happiness: d1
                };
                HAPPINESS.map(([key, name]) => result[key] = _d1[key][year]);
                return result;
            }
        }).filter(x => x).sort((a, b) => a[sort] - b[sort]);
        
        let order = temp.length;
        for (let i of temp) {
            i.order = order + "thstndrd".substr(
                (order / 10 |0) % 10 == 1 || order % 10 == 0 || order % 10 > 3 ? 0 : order % 10 * 2,
                2
            );
            order--;
        }
        compo.data = temp;
    }
    $("#order").on("change", function() {
        setComponentsYear(selectedYear);
    });
    
    $(".switch-btn", "#map_year").on("click", function() {
        selectedYear = this.id.slice(1);
        loadYearMap(selectedYear);
        setComponentsYear(selectedYear);
    });
    $("#_2019").trigger("click");
}

function fetchData() {
    showOverlayMessage("Loading data source...");
    fetch("data_source.json")
        .then(x => x.json())
        .then(function(sources) {
            let allData = {};
            let length = sources.length;
            let nowNum = 0;
            function readSource() {
                let jsonPath = sources.pop();
                if (jsonPath) {
                    showOverlayMessage(`Loading JSON files... (${++nowNum}/${length})`);
                    fetch(jsonPath)
                        .then(x => x.json())
                        .then(function(data) {
                            function deepAssign(target, source) {
                                for (let i in source) {
                                    if (source[i] instanceof Object) {
                                        if (!target[i])
                                            target[i] = {};
                                        deepAssign(target[i], source[i]);
                                    }
                                    else
                                        target[i] = source[i];
                                }
                            }
                            deepAssign(allData, data);
                            readSource();
                        })
                        .catch(readSource);
                }
                else
                    ready(allData);
            }
            readSource();
        })
        .catch(console.error);
}