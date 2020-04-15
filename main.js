const client_id = 'NEh3V0ZjaE1fT1Nkdk9jMnJlSGNQQTpkZmJhZTQyMDhiNWY3MzEw';

function look_at([lon, lat], heading){
	const D = 100; //m
	const R = 6378137.0; //m
	
	const dlat = Math.asin(D * Math.cos(rad(heading))/R);
	const dlon = Math.asin(D*Math.sin(rad(heading))/R/Math.sin(rad(90-lat)));
	
	return [lon + deg(dlon), lat + deg(dlat)];
}
function deg(angle) {
	return angle/Math.PI * 180;
}
function rad(angle) {
	return angle / 360 * 2 * Math.PI;
}

window.onload = () => {
  const video  = document.querySelector("#camera");
  const canvas = document.querySelector("#picture");
  const se     = document.querySelector('#se');

  /** カメラ設定 */
  const constraints = {
    audio: false,
    video: {
      width: 200,
      height: 300,
      //facingMode: "user"   // フロントカメラを利用する
       facingMode: { exact: "environment" }  // リアカメラを利用する場合
    }
  };

  /**
   * カメラを<video>と同期
   */
  navigator.mediaDevices.getUserMedia(constraints)
  .then( (stream) => {
    video.srcObject = stream;
    video.onloadedmetadata = (e) => {
      video.play();
    };
  })
  .catch( (err) => {
    console.log(err.name + ": " + err.message);
  });

  /**
   * シャッターボタン
   */
   document.querySelector("#shutter").addEventListener("click", () => {
    //const ctx = canvas.getContext("2d");

    // 演出的な目的で一度映像を止めてSEを再生する
    video.pause();  // 映像を停止
    se.play();      // シャッター音
    setTimeout( () => {
      video.play();    // 0.5秒後にカメラ再開
    }, 500);
	//https://qiita.com/akkey2475/items/81f4f94f17bfe5c7ce42
	navigator.geolocation.getCurrentPosition(
        // 取得成功した場合
        function(position) {
			
			const lat = position.coords.latitude;
			const lon = position.coords.longitude;
			const heading = position.coords.heading;
			
			const lookat = look_at([lon, lat],heading);
			
            const url = 'https://a.mapillary.com/v3/images?client_id=' + client_id + '&closeto=' + lon + ',' + lat + /*'&lookat=' + lookat[0] + ',' + lookat[1] +*/ '&per_page=1&radius=20&pano=false';
			
			console.log(url);
			
			const request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.onload = function () {

				const data = JSON.parse(this.response);
				console.log(JSON.stringify(data));
				const photos = data.features;
				if (photos.length < 1) {document.getElementById("mapillary").innerText = "No photo around here"; retrun;};
				const photo = photos[0];
				const properties = photo.properties;
				const key = properties.key;
				const captured_at = properties.captured_at;
				const username = properties.username;
				const img = 'https://images.mapillary.com/' + key + '/thumb-320.jpg';
				document.getElementById("mapillary").innerHTML = '<img src="' + img + '">';
				const d =  new Date(captured_at);
				document.getElementById("captured_at").innerText ="Captured at: " + d.toLocaleString() + ", By: " + username + " CC BY-SA";
				
			};
			request.send();
        },
        // 取得失敗した場合
        function(error) {
          switch(error.code) {
            case 1: //PERMISSION_DENIED
              alert("位置情報の利用が許可されていません");
              break;
            case 2: //POSITION_UNAVAILABLE
              alert("現在位置が取得できませんでした");
              break;
            case 3: //TIMEOUT
              alert("タイムアウトになりました");
              break;
            default:
              alert("その他のエラー(エラーコード:"+error.code+")");
              break;
          }
		 }
		 );
    // canvasに画像を貼り付ける
    //ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  });
};