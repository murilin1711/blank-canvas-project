<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Mapa Colorido - Localização da Empresa</title>
  <link href="https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.css" rel="stylesheet" />
  <style>
    #map {
      width: 100%;
      height: 400px;
      border-radius: 12px;
    }
  </style>
</head>

<body>
  <div id="map"></div>

  <script src="https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.js"></script>
  <script>
    // Coordenadas do endereço
    const empresa = {
      lat: -16.328470,
      lng: -48.952870
    };

    const map = new maplibregl.Map({
      container: 'map',
      style: "https://api.maptiler.com/maps/bright/style.json?key=1gXFt9mkSWAwobaSVONk",
      center: [empresa.lng, empresa.lat],
      zoom: 16
    });

    // Controles de zoom
    map.addControl(new maplibregl.NavigationControl());

    // Marcador vermelho
    new maplibregl.Marker({ color: "red" })
      .setLngLat([empresa.lng, empresa.lat])
      .addTo(map);
  </script>

</body>
</html>
