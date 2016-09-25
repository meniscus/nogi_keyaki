console.log("keyakizaka run");

// やっつけの拡張関数
Array.prototype.getLastVal = function (){ return this[this.length -1];}

// TODO
// 実行時間の計測 -> また即時関数で包みたくない。
//                -> または、シェルで頑張る(一番かんたん)
// ログレベルによって出力内容を分けたい -> ログの独自実装が必要かも。
//                                      -> デフォルトだとinfoですら詳しすぎる
// 日次でzip作りたい -> zip.js / JSzip.js / シェルで頑張る(一番かんたん)
//

var casper = require('casper').create({
	verbose: true,
//	logLevel: 'error'
//	logLevel: 'debug'
//	logLevel: 'info'
});
var fs = require('fs');

var imgPath = 'img_keyaki/';

var rootUrl = "http://www.keyakizaka46.com";
var baseUrl = "http://www.keyakizaka46.com/mob/news/diarKijiShw.php?site=k46o&ima=0000&cd=member&id="
casper.start();

var start_id = 56; // 56始まりな模様
var end_id = 9999 // end_idをどうやって決めるか？

// 最新のブログIDの取得(終点決定）
casper.thenOpen("http://www.keyakizaka46.com/mob/news/diarShw.php?site=k46o&ima=0000&cd=member", function() {
	var latest_url = casper.getElementAttribute('div.box-newposts ul li:first-child a', 'href');
	end_id = latest_url.match(/id=(.+)&/)[1];
});


for (var blog_id = start_id; blog_id <= end_id ; blog_id++) {
// 	console.log("for loop started : " + blog_id);
 	(function(blogid) {
 		casper.thenOpen(baseUrl + blogid, function() {
			console.log("url opened blogid:" + blogid);

			// 設定する名前・日付を取得
			var blog_info = {name : "", date : "", is_not_found : false};
			blog_info = casper.evaluate(function() {
				if (document.querySelectorAll(".box-date time").length == 0) {
					// 日付がなければ対象のブログなしと判断する
					return {name: "", date : "", is_not_found : true};
				}

				// TODO ファイル名日本語になるので、Mappingとか必要？
				var name =  document.querySelector(".name a").innerHTML.replace(" ", "");
				var date = (document.querySelectorAll(".box-date time")[0].innerHTML
							+ document.querySelectorAll(".box-date time")[1].innerHTML).replace(".", "");
				return {name: name, date: date};
			});

			if (blog_info.is_not_found == true) {
				return;
			}

			// 画像を探す
			var images = casper.evaluate(function() {
				var urls = [];
				var images_dom = document.querySelectorAll(".box-article img")
				for (var i = 0; i < images_dom.length; i++) {
					urls.push(images_dom[i].getAttribute("src"));
				}
				return urls;
			});
			
			// ダウンロードする
			for (var i = 0 ; i < images.length; i++) {
				var file_name = blog_info.name + blog_info.date + i + ".jpg";
				console.log("file_name : " + file_name);
				if (!fs.exists(imgPath + file_name)) {
					console.log("file download : " + images[i]);
					this.download(rootUrl + images[i], imgPath + file_name);
				} else {
					console.log("a");
					console.log("file exist. skipped : " + file_name);
				}
			}
 
 		});
 	})(blog_id);
}


casper.run();



