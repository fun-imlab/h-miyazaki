var map = L.map('map').setView([41.7736, 140.7281], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

var markers = L.markerClusterGroup();
map.addLayer(markers);

var initialMarkersData;

var currentLocationCircle = L.circle([0, 0], { radius: 10, color: 'blue' }).addTo(map);

// ローカルで読み込む JSON ファイルのパス
var jsonFilePath = 'mapping_all.json';

// JSON ファイルからデータを非同期で取得
fetch(jsonFilePath)
  .then(response => response.json())
  .then(data => {
    initialMarkersData = data;
    plotMarkers(data);
  })
  .catch(error => console.error('Error fetching JSON:', error));

function plotMarkers(data) {
  markers.clearLayers();

  for (var i = 0; i < data.length; i++) {
    var markerData = data[i];
    var lat = markerData["緯度"];
    var lon = markerData["経度"];
    var name = markerData["名前"];
    var year = markerData["年号"];
    var words = markerData["抽出された言葉"];
    var sentence = markerData["抽出された文"];
    var imageFileName = markerData["写真"];
    
    // マーカーを追加
    var marker = L.marker([lat, lon])
      .bindPopup(createPopupContent(name, year, words, sentence, imageFileName));

    markers.addLayer(marker);
  }
}

function createPopupContent(name, year, words, sentence, imageFileName) {
  var popupContent = '<div class="popup-content">';
  popupContent += '<div class="popup-left">';
  popupContent += '<b>' + name + '</b><br>' + year + '<br>' + words + '<br>' + sentence;
  popupContent += '</div>';
  popupContent += '<div class="popup-right">';
  popupContent += '<img class="popup-image" src="image/' + imageFileName + '" alt="Image">';
  popupContent += '</div>';
  popupContent += '</div>';
  return popupContent;
}

// Geolocation APIを使用して現在位置を取得
function updateLocation() {
  navigator.geolocation.getCurrentPosition(function (position) {
    var latlng = L.latLng(position.coords.latitude, position.coords.longitude);

    // 現在地の円を更新
    currentLocationCircle.setLatLng(latlng);
  });
}

// マップを現在地にズームインして移動
function centerMap() {
  navigator.geolocation.getCurrentPosition(function (position) {
    var latlng = L.latLng(position.coords.latitude, position.coords.longitude);
    map.setView(latlng, 18); // 18はズームレベル。お好みで調整してください。
  });
}

// 名前でマーカーを検索
function searchMarkers() {
  var searchInput = document.getElementById('searchInput').value.toLowerCase();
  var filteredMarkersData = initialMarkersData.filter(function(markerData) {
    return markerData["名前"].toLowerCase().includes(searchInput);
  });
  plotMarkers(filteredMarkersData);
}

// 定期的に位置情報を更新
setInterval(updateLocation, 1000); // 1000ミリ秒ごとに更新（1秒ごと）

// 最初の位置情報を取得
updateLocation();
