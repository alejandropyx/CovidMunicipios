    

var Municipios =[]
var Departamentos=[]
var ConFuncion=[]
var CovidData=[]

var ConVuelos=[]


$(document).ready(function() {
  var lines = [];

  $.ajax({
      type: "GET",
      url: "Municipios.json",
      dataType: "text",
      success: function(data) {Municipios = JSON.parse(data);}
   });


   $.ajax({
      type: "GET",
      url: "Departamentos.json",
      dataType: "text",
      success: function(data) {Departamentos = JSON.parse(data);}
   });

   $.ajax({
      type: "GET",
      url: "ConFuncionT.json",
      dataType: "text",
      success: function(data) {ConFuncion = JSON.parse(data);}
   });

   $.ajax({
    type: "GET",
    url: "CovidData.json",
    dataType: "text",
    success: function(data) {CovidData = JSON.parse(data);}
 });




});



function GetSortOrder(prop) {    
    return function(a, b) {    
        if (a[prop] > b[prop]) {    
            return 1;    
        } else if (a[prop] < b[prop]) {    
            return -1;    
        }    
        return 0;    
    }    
}    

function GetSortOrderDesc(prop) {    
  return function(a, b) {    
      if (a[prop] < b[prop]) {    
          return 1;    
      } else if (a[prop] > b[prop]) {    
          return -1;    
      }    
      return 0;    
  }    
} 


$(document).ajaxComplete(function( event, xhr, settings ) {    



    Nodos = Municipios.sort(GetSortOrder("Municipio"));   
    Deptos = Departamentos.sort(GetSortOrder("Departamento")); 
    edges = ConFuncion.sort(GetSortOrderDesc("Total")); 

    

    

    function findNodes(Data, id){
        var result=[]
        for(var i = 0; i < edges.length; i++) {
            var obj = edges[i];
                if (obj.Id_Origen == id){
                    result.push(obj)
                }        
        }
        return result
    }

    function findNode(id){       
        for(var i = 0; i < Nodos.length; i++) {
            var obj = Nodos[i];
                if (obj.ID == id){
                    return obj
                }        
        }        
    }

    function dataCovid(id){       
      for(var i = 0; i < CovidData.length; i++) {
          var obj = CovidData[i];
              if (obj.ID == id){
                  return obj
              }        
      }        
  }


  function findLonLat( id){    
      var result=[]
      for(var i = 0; i < edges.length; i++) {
        var obj = Nodos[i];
        if (typeof obj === "undefined")
          continue;
        if (obj.ID == id){
            result.push(obj.Lon)
            result.push(obj.Lat)
            break;
        }        
      }
      return result
  }

  


var  a=  require(["esri/views/MapView", "esri/WebMap", "esri/geometry/Point", "esri/Graphic"], function (
      MapView,
      WebMap,
      Point,
      Graphic
    ) {
      /************************************************************
       * Creates a new WebMap instance. A WebMap must reference
       * a PortalItem ID that represents a WebMap saved to
       * arcgis.com or an on-premise portal.
       *
       * To load a WebMap from an on-premise portal, set the portal
       * url with esriConfig.portalUrl.
       ************************************************************/
      var webmap = new WebMap({
          basemap : "streets-navigation-vector"
      });

      /************************************************************
       * Set the WebMap instance to the map property in a MapView.
       ************************************************************/
      var view = new MapView({
        map: webmap,
        container: "viewDiv",
        
      });

      var symbol = {
      type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
      style: "square",
      color: "blue",
      size: "8px",  // pixels
      outline: {  // autocasts as new SimpleLineSymbol()
          color: [ 255, 255, 0 ],
          width: 2  // points
      }
      };

      // Set the center and zoom level on the view
      view.center = [-73.6285, 4.1492];  // Sets the center point of the view at a specified lon/lat
      view.zoom = 5;  // Sets the zoom LOD to 13
      
      // Set the extent on the view
      var markerSymbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: [226, 119, 40],
        outline: {
          // autocasts as new SimpleLineSymbol()
          color: [255, 255, 255],
          width: 1
        }
      };

      Edges = []

      Nodes = []
      function showEdges(){
      
          Edges = []

          puntos = []

          Nodes = []
          var valor = document.getElementById("pconexion").value
          
          var nMostrar = edgesToShow.length*(parseInt(valor, 10)*0.01)

          if (nMostrar<1)
            return
          //nMostrar=5

          var tipoViaje = document.getElementById("tipoViaje-dropdown").value

          
          edges = ConFuncion.sort(GetSortOrderDesc(tipoViaje)); 

          console.log(tipoViaje)

          var origen = findLonLat( document.getElementById("locality-dropdown").value)
          var origenActual = findNode(document.getElementById("locality-dropdown").value)
          Nodes.push(findNode(document.getElementById("locality-dropdown").value))
          var maxConnection = edgesToShow[0][tipoViaje]

          console.log(nMostrar)

          for(var i = 0; i < nMostrar ; i++) {


            var obj = edgesToShow[i];
          
            var destino = findLonLat(obj.Id_Destino)

            var destinoActual = findNode(obj.Id_Destino)

            if (typeof destinoActual === "undefined"){            
              continue;
            }
              
            if (obj[tipoViaje] == 0){
              continue;
            }

            

            Nodes.push(destinoActual)
            
            var color = [82, 77, 163]
            if (obj[tipoViaje]/maxConnection > 0.5) color = [163, 40, 49]
            
            


            var lineSymbol = {
            type: "simple-line", // autocasts as SimpleLineSymbol()
            color: color,
            width: ((obj[tipoViaje]/maxConnection)*5)+2
            };

            var polyline = {
            type: "polyline", // autocasts as new Polyline()
            paths: [
            origen,
            destino
            ]
            };

            var lineAtt = {            
            "msg": "El "+ Math.round((obj[tipoViaje]/obj["Total"])*10000)/100 +"% se los viajes totales terrestres entre "+origenActual["Municipio"]+" y "+destinoActual["Municipio"]+" son por motivos de "  +  tipoViaje +"."
            };

            if (tipoViaje == "Vuelos")

            lineAtt = {             
              "msg": "El flujo entre "+origenActual["Municipio"]+" y "+destinoActual["Municipio"]+" mediante viajes aéreos es de aproximadamente"+ obj[tipoViaje]+" personas al mes."
              };

            if (tipoViaje == "Totales")

            lineAtt = {            
              "msg": "El flujo de "+origenActual["Municipio"]+" a "+destinoActual["Municipio"]+" por viajes terrestres representa el "+ Math.round((obj[tipoViaje]/obj["TTotal"])*10000)/100 +"% de los viajes Totales."
              };

            
            Edges.push(new Graphic({
                geometry: polyline,
                symbol: lineSymbol,
                attributes: lineAtt,
                popupTemplate: {
            // autocasts as new PopupTemplate()
                title: "{msg}"
                  }   
                }))


          }
      console.log(i)
      plotPuntos(Nodes)

      //graphicsToShow = [...Edges]
      graphicsToShow = [...Edges]

      
      
      graphicsToShow = graphicsToShow.concat(puntos)
      view.graphics.addMany(graphicsToShow);
      }
      function closestNode(lon, lat){
          
          for(var i = 0; i < Nodos.length; i++) {
          var obj = Nodos[i];
          var radio = 0.4
          if (obj.Lon <= lon + radio && obj.Lon >= lon - radio && obj.Lat <= lat + radio && obj.Lat >= lat-radio ){
              return obj.ID
          }        
          }
          return 0
      
      }

      var bool_ShowEdges = true
  
      view.on("click", function(event) {});

      puntos =[]

      function plotPuntos(Nodos){
        puntos =[]
      for(var i = 0; i < Nodos.length; i++) {
      var obj = Nodos[i];

      var datacovid_actua = dataCovid(obj.ID)

      var point = {
          type: "point", // autocasts as new Point()
          longitude: obj.Lon,
          latitude: obj.Lat
          };

          var lineAtt = {
          Name: obj.Municipio,
          "Casos Confirmados": datacovid_actua["Confirmados"],
          "Casos Existentes": datacovid_actua["Existentes"],
          "Casos Recuperados": datacovid_actua["Recuperados"],
          Muertes: datacovid_actua["Muertos"]
          };

          var markerSymbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: [207, 200, 200],
        outline: {
          // autocasts as new SimpleLineSymbol()
          color: [255, 255, 255],
          width: 2
          }
          }
          

          

          puntos.push(new Graphic({
              geometry: point,
              symbol: markerSymbol,
              attributes: lineAtt,
              popupTemplate: {
          // autocasts as new PopupTemplate()
          title: "{Name}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "Name"
                },
                {
                  fieldName: "Casos Confirmados"
                },
                {
                  fieldName: "Casos Existentes"
                },
                {
                  fieldName: "Casos Recuperados"
                },
                {
                  fieldName: "Muertes"
                }
              ]
            }
          ]
        }
              }))
      }

    }

      //plotPuntos(Nodos)

      graphicsToShow =[]
      

      //view.graphics.addMany(graphicsToShow);      

      function showCoordinates(evt) {
        //the map is in web mercator but display coordinates in geographic (lat, long)
        var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
        //display mouse coordinates
       // console.log(mp.x.toFixed(3) + ", " + mp.y.toFixed(3))
        dom.byId("info").innerHTML = mp.x.toFixed(3) + ", " + mp.y.toFixed(3);
      }

      function createTable(){

        var table = document.createElement("table");
        table.id="tableDataFilter"
        //var txt = "<tr> <th>Destino</th><th>Viajes por salud</th><th>Viajes por Trabajo</th><th>Viajes por Educación</th><th>Viajes Totales Terrestres</th><th>Viajes Aereos</th><th>Viajes  Totales</th> <th>Casos Confirmados</th><th>Casos Existentes</th><th>Casos Recuperados</th><th>Muertes</th>  </tr>"
        var txt = "<tr> <th>Destino</th><th>Viajes por salud</th><th>Viajes por Trabajo</th><th>Viajes por Educación</th><th>Viajes Totales Terrestres</th><th>Viajes Aereos</th><th>Viajes  Totales</th></tr>"
        
        table.innerHTML = txt;

        var valor = document.getElementById("pconexion").value
        var nMostrar = edgesToShow.length*(parseInt(valor, 10)*0.01)

          if (nMostrar<1)
            return

        for(var i=0; i< 10; i++){

          var obj = edgesToShow[i];         
           

          var destinoActual = findNode(obj.Id_Destino)

          if (typeof destinoActual === "undefined"){            
            continue;
          }

          var datacovid_actua = dataCovid(obj.Id_Destino)

          txt += "<tr> <td>"+destinoActual["Municipio"]+"</td><td>"+obj["Salud"]+"</td><td>"+obj["Trabajo"]+"</td> <td>"+obj["Educacion"]+"</td><td>"+obj["Total"]+"</td><td>"+obj["Vuelos"]+"</td><td>"+obj["TTotal"]+"</td>  </tr>"
          datacovid_actua["Confirmados"]
        }

        table.innerHTML = txt;

        var divContainer = document.getElementById("showData");
        
        divContainer.appendChild(table);

      }

      function createHeader(id){

        var datacovid_actua = dataCovid(id)

        var div = document.createElement("div");
        div.classList.add("DataMainNode")
        var destinoActual = findNode(id)


        var txt = "<h3> Mostrando los 10 aliados más fuertes de "+destinoActual["Municipio"]+"</h3>"
        //txt += "<h4 class=\"subData\"> Casos Confirmados </h4>"+datacovid_actua["Confirmados"]
        //txt += "<h4 class=\"subData\"> Casos Existentes </h4>"+datacovid_actua["Existentes"]
        //txt += "<h4 class=\"subData\"> Casos Recuperados </h4>"+datacovid_actua["Recuperados"]
        //txt += "<h4 class=\"subData\"> Muertes </h4>"+datacovid_actua["Muertos"]

        div.innerHTML = txt;

        var divContainer = document.getElementById("showData");
        divContainer.innerHTML = "";
        divContainer.appendChild(div);

      }

     $('#graficar').click( function myFunction() {
        document.getElementById('Mostrando').innerHTML = "Mostrando las conexiones de " + document.getElementById("locality-dropdown").value + "-"+$( "#locality-dropdown option:selected" ).text();

        if( document.getElementById("locality-dropdown").value != 0){    
            document.getElementById("tableDiv").style.display = "block";
            view.graphics.removeMany(Edges); 
            view.graphics.removeMany([Edges]); 
            view.graphics.removeAll()     
            
            view.center = findLonLat(document.getElementById("locality-dropdown").value);  // Sets the center point of the view at a specified lon/lat
            view.zoom = 6;
            
            
            edgesToShow = findNodes(edges, document.getElementById("locality-dropdown").value)
            showEdges()
            bool_ShowEdges = !bool_ShowEdges
            createHeader(document.getElementById("locality-dropdown").value)
            createTable()
        }
        else{
             view.graphics.removeMany(graphicsToShow);
             document.getElementById("tableDiv").style.display = "none";
            }
      })
    });

    

    // Sección para DropDowns
    $( document ).ready(function() {
     let dropdown = $('#locality-dropdown');

      dropdown.empty();

      dropdown.append('<option selected="true" disabled>Municipio</option>');
      dropdown.prop('selectedIndex', 0);

      let dropdownDepto = $('#Departamento-dropdown');

      dropdownDepto.empty();

      dropdownDepto.append('<option selected="true" disabled>Departamento</option>');
      dropdownDepto.prop('selectedIndex', 0);


      $.each(Deptos, function (i, p) {                
        dropdownDepto.append($('<option></option>').attr('value', p.ID).text(p.Departamento))  
      });    

      dropdownDepto.change(function(){ 
        var value = $(this).val();

        console.log(value)

        dropdown.children('option:not(:first)').remove();

        dropdown.prop( "disabled", false );

        $.each(Nodos, function (i, p) {              
            if ( p.ID_depto == value)
            dropdown.append($('<option></option>').attr('value', p.ID).text(p.Municipio))           
            
        });

        });

      dropdown.change(function(){
        var value = $(this).val();

        if(value ==0)
            $('#graficar').prop( "disabled", true );
        else 
            $('#graficar').prop( "disabled", false );
       
      });
      });

  });    

  //window.addEventListener("load", pageFullyLoaded, false);


  function pageFullyLoaded(e) {
    var modal = document.querySelector(".modal");
      modal.classList.toggle("show-modal");
  } 
  
  function hideSection(s){

    var x = 0
    if (s==1)
       x = document.getElementById("collapseExample2");
    if (s==2)
       x = document.getElementById("collapseExample3");
    if (s==3)
       x = document.getElementById("collapseExample4");


      if (x.style.display === "none") {
        x.style.display = "";
      } else {
        x.style.display = "none";
      }


  }
        

