console.log("nogizaka run");

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
	logLevel: 'error'
	//logLevel: 'debug'
	// logLevel: 'info'
});
var fs = require('fs');

var imgPath = 'img/';

var baseUrl = "http://blog.nogizaka46.com/"
var names = [
	'manatsu.akimoto',
	'erika.ikuta',
	'rina.ikoma',
	'karin.itou',
	'junna.itou',
	'marika.ito',
	'sayuri.inoue',
	'misa.eto',
	'hina.kawago',
	'mahiro.kawamura',
	'hinako.kitano',
	'asuka.saito',
	'chiharu.saito',
	'yuuri.saito',
	'iori.sagara',
	'reika.sakurai',
	'kotoko.sasaki',
	'mai.shiraishi',
	'mai.shinuchi',
	'ayane.suzuki',
	'kazumi.takayama',
	'ranze.terada',
	'kana.nakada',
	'himeka.nakamoto',
	'nanase.nishino',
	'ami.noujo',
	'nanami.hashimoto',
	'hina.higuchi',
	'minami.hoshino',
	'miona.hori',
	'sayuri.matsumura',
	'rena.yamazaki',
	'yumi.wakatsuki',
	'miria.watanabe',
	'maaya.wada',
	'kenkyusei'
];

casper.start();

// ファイル名をどうするか決める必要がある
// manatsu.akimoto.[blogID(xxxxxx.phpのxxx部分)].連番
// 日付だと複数回の投稿があった場合、blogIDのほうがよさそうだが

for (var name_index = 0; name_index < names.length; name_index++) {
	(function(name) {
		casper.thenOpen(baseUrl + name, function() {
			// ブログの1ページ目をすべて取得する
			blogs = casper.evaluate(function() {
				var len = document.querySelectorAll("span.entrytitle a").length;
				var urls = [];
				for (var i=0; i < len; i++) {
					urls.push(document.querySelectorAll("span.entrytitle a")[i].getAttribute("href"));
				}
				return urls
			});
		
			for (var blog_index = 0; blog_index < blogs.length; blog_index++) {
				(function(blog_idx) {

//					console.log("blog open : " + blogs[blog_idx]);
					casper.log("blog open : " + blogs[blog_idx], 'debug');
					casper.thenOpen(blogs[blog_idx], function () {
						// 取得したブログを開く
				 	 	var imgages = [];
				 	 	images = casper.evaluate(function() {
				 	 		var len = document.querySelectorAll("a[href*=dcimg]").length;
				 	 		var urls = [];
				 	 		for (var i=0; i < len; i++) {
				 	 			urls.push(document.querySelectorAll("a[href*=dcimg]")[i].getAttribute("href"));
				 	 		}
				 	 		return urls
				 	 	});

						// ブログの日時を取得
						var date = "";
						date = casper.evaluate(function() {
							var ret = document.querySelector(".yearmonth").innerHTML + document.querySelector(".dd1").innerHTML;
							ret = ret.replace("/", "");
							return ret;
						});

						var blog_id = blogs[blog_idx].split("/").getLastVal().replace(".php","");
//						console.log("blog_id : " + blog_id);
						casper.log("blog_id : " + blog_id, 'debug');
				
						for (var i = 0 ; i < images.length; i++) {
							(function(n) {
//								console.log("url open : " + images[n]);
								var file_name = name + date + blog_id  + n + ".jpg";
								if (!fs.exists(imgPath + file_name)) {
									casper.log("url open : " + images[n], 'debug');
									casper.thenOpen(images[n], function() {
										var img = "";
										img = casper.evaluate(function() {
											// 画像ページなので、1枚しかない想定
									 		return document.querySelector("img").getAttribute("src");
										});

										console.log("file download : " + file_name );
										this.download(img, imgPath + file_name);
										console.log(imgPath + file_name);
									});
								} else {
									console.log("file exist. skipped : " + file_name);
								}
							})(i);
						}
					});
				})(blog_index);
			}
		});
	})(names[name_index]);
}

casper.run();

