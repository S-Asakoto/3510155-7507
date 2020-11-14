function showOverlayMessage(msg) {
	$("#overlay").show();
	$("#overlay div").html(msg);
}

let map = null, compo = null, radar = null, polygons = null, detail = null, line1 = null, line2 = null;

$(document).ready(function() {
	$(".overlay, .charts").hide();
    $(".switch-btn", "#nav").on("click", function() {
        $(".charts").hide();
        $(".switch-btn", "#nav").removeClass("default");
        $(this.id.replace(/^_/, "#")).show();
        $(this).addClass("default");
    });
    $("#_map").trigger("click");

    // overview
	map = am4core.create("map", am4maps.MapChart);
	map.geodata = am4geodata_worldLow;
	polygons = new am4maps.MapPolygonSeries();
	polygons.useGeodata = true;
    polygons.calculateVisualCenter = true;
	polygons.exclude = ["AQ"];
    
	map.series.push(polygons);
      
    /*
    let labelSeries = map.series.push(new am4maps.MapImageSeries());
    let labels = labelSeries.mapImages.template.createChild(am4core.Label);
    labels.horizontalCenter = "middle";
    labels.verticalCenter = "middle";
    labels.fontSize = 10;
    labels.nonScaling = true;
    labels.interactionsEnabled = false;
  
    polygons.events.on("inited", function() {
        polygons.mapPolygons.each(function(polygon) {
            let label = labelSeries.mapImages.create();
            label.zIndex = 1;
            label.latitude = polygon.visualLatitude;
            label.longitude = polygon.visualLongitude;
            label.showOnInit = false;
            label.children.getIndex(0).text = Country.name(polygon.dataItem.dataContext.id); 
        });        
    });
    */
    
	let hs = polygons.mapPolygons.template.states.create("hover");
	hs.properties.fill = am4core.color("#0a3fa3");

	let homeBtn = map.chartContainer.createChild(am4core.Button);
	homeBtn.padding(5, 5, 5, 5);
	homeBtn.align = "right";
    homeBtn.y = 40;
	homeBtn.events.on("hit", function() {
	  map.goHome();
	});
	homeBtn.icon = new am4core.Sprite();
	homeBtn.icon.path = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";

	map.zoomControl = new am4maps.ZoomControl();

	map.smallMap = new am4maps.SmallMap();
	map.smallMap.series.push(polygons);
    
    radar = am4core.create("radar", am4charts.RadarChart);
    let rTitle = radar.titles.create();
    rTitle.text = "Category-wise score";
    rTitle.fontSize = 24;
    
    // components
    
    compo = am4core.create("compo_real", am4charts.XYChart);
    compo.cursor = new am4charts.XYCursor();
    compo.cursor.maxTooltipDistance = -1;
    compo.paddingBottom = 60;
    compo.legend = new am4charts.Legend();
    compo.legend.position = "top";
    
    detail = am4core.create("detail", am4charts.XYChart);
    detail.cursor = new am4charts.XYCursor();
    
    line1 = am4core.create("line1", am4charts.XYChart);
    line1.cursor = new am4charts.XYCursor();
    let l1Title = line1.titles.create();
    l1Title.text = "Past trends";
    l1Title.fontSize = 24;
    line1.legend = new am4charts.Legend();
    
    line2 = am4core.create("line2", am4charts.XYChart);
    line2.cursor = new am4charts.XYCursor();
    let l2Title = line2.titles.create();
    l2Title.text = "Past trends";
    l2Title.fontSize = 24;
    line2.legend = new am4charts.Legend();
    
	fetchData();
});