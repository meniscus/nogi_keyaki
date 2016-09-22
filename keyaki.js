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

// ct = メンバーID？
// id = ブログのID？(個別ページにのみ存在)
// cd = 'member'(固定)
// page = ページ数(個別ページには存在しないが、あってもエラーにならない)
//
// idとctは共存しなさそうなので、IDを舐めればよい？
// 番号飛んでそうなので、どうしようか。


// 最新のブログIDの取得(終点決定）
casper.thenOpen("http://www.keyakizaka46.com/mob/news/diarShw.php?site=k46o&ima=0000&cd=member", function() {
	var latest_url = casper.getElementAttribute('div.box-newposts ul li:first-child a', 'href');
	end_id = latest_url.match(/id=(.+)&/)[1];
});


for (var blog_id = start_id; blog_id < end_id ; blog_id++) {
// console.log("for loop started : " + blog_id);
 	(function(blogid) {
 		casper.thenOpen(baseUrl + blogid, function() {
		console.log("test blogid:" + blogid); // XXX これが1回しかコールされないのはおかしい
			// 設定する名前・日付を取得
			var blog_info = {name : "", date : ""};
			blog_info = casper.evaluate(function() {
				// TODO ファイル名日本語になるので、Mappingとか必要？
				var name =  document.querySelector(".name a").innerHTML;
				var date = (document.querySelectorAll(".box-date time")[0].innerHTML
							+ document.querySelectorAll(".box-date time")[1].innerHTML).replace(".", "");
				return {name: name, date: date};
			});

			// 画像を探して
			var images = casper.evaluate(function() {
				var urls = [];
				var images_dom = document.querySelectorAll(".box-article img")
				for (var i = 0; i < images_dom.length; i++) {
					urls.push(images_dom.getAttribute("src"));
				}
				return urls;
			});
			
			// ダウンロードする
			for (var i = 0 ; i < images.length; i++) {
				// ここにファイルの存在チェックを追加
				console.log("file download");
				this.download(images[i], 'filename' + i );
			}
 
 		});
 	})(blog_id);
}


// 	(function(name) {
// 		casper.thenOpen(baseUrl + name, function() {
// 			// ブログの1ページ目をすべて取得する
// 			blogs = casper.evaluate(function() {
// 				var len = document.querySelectorAll("span.entrytitle a").length;
// 				var urls = [];
// 				for (var i=0; i < len; i++) {
// 					urls.push(document.querySelectorAll("span.entrytitle a")[i].getAttribute("href"));
// 				}
// 				return urls
// 			});
// 		
// 			for (var blog_index = 0; blog_index < blogs.length; blog_index++) {
// 				(function(blog_idx) {
// 
// //					console.log("blog open : " + blogs[blog_idx]);
// 					casperylog("blog open : " + blogs[blog_idx], 'debug');
// 					casper.thenOpen(blogs[blog_idx], function () {
// 						// 取得したブログを開く
// 				 	 	var imgages = [];
// 				 	 	images = casper.evaluate(function() {
// 				 	 		var len = document.querySelectorAll("a[href*=dcimg]").length;
// 				 	 		var urls = [];
// 				 	 		for (var i=0; i < len; i++) {
// 				 	 			urls.push(document.querySelectorAll("a[href*=dcimg]")[i].getAttribute("href"));
// 				 	 		}
// 				 	 		return urls
// 				 	 	});
// 
// 						// ブログの日時を取得
// 						var date = "";
// 						date = casper.evaluate(function() {
// 							var ret = document.querySelector(".yearmonth").innerHTML + document.querySelector(".dd1").innerHTML;
// 							ret = ret.replace("/", "");
// 							return ret;
// 						});
// 
// 						var blog_id = blogs[blog_idx].split("/").getLastVal().replace(".php","");
// //						console.log("blog_id : " + blog_id);
// 						casper.log("blog_id : " + blog_id, 'debug');
// 				
// 						for (var i = 0 ; i < images.length; i++) {
// 							(function(n) {
// //								console.log("url open : " + images[n]);
// 								var file_name = name + date + blog_id  + n + ".jpg";
// 								if (!fs.exists(imgPath + file_name)) {
// 									casper.log("url open : " + images[n], 'debug');
// 									casper.thenOpen(images[n], function() {
// 										var img = "";
// 										img = casper.evaluate(function() {
// 											// 画像ページなので、1枚しかない想定
// 									 		return document.querySelector("img").getAttribute("src");
// 										});
// 
// 										console.log("file download : " + file_name );
// 										this.download(img, imgPath + file_name);
// 										console.log(imgPath + file_name);
// 									});
// 								} else {
// 									console.log("file exist. skipped : " + file_name);
// 								}
// 							})(i);
// 						}
// 					});
// 				})(blog_index);
// 			}
// 		});
// 	})(names[name_index]);
// }

casper.run();



