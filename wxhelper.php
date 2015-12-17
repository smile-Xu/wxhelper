<?php
require_once "jssdk.php";
$jssdk = new JSSDK("id", "password");
$signPackage = $jssdk->GetSignPackage();
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<script src="wxhelper.js"></script>
</head>
<body>
	<script>
		wxhelper.ready(function(){
			this.config({
				appId: '<?php echo $signPackage["appId"];?>',
			    timestamp: <?php echo $signPackage["timestamp"];?>,
			    nonceStr: '<?php echo $signPackage["nonceStr"];?>',
			    signature: '<?php echo $signPackage["signature"];?>',
			    api : ['share']
			}).share({
				title : 'sample', // 标题
				desc : 'This is a sample of api for wechat', // 描述 分享到朋友圈时这个字段没用
				link : 'http://www.haosou.com', // 链接地址
				imgUrl : 'http://p8.qhimg.com/t01c14443a9628c3db9.png', // 图片地址
				type : '', // 类型 : link/music/video 默认为link 仅在"分享给朋友"时有用
				dataUrl : '', // 如果type是music或video 则要提供数据链接 默认为空
				success : function(){
					alert('成功分享');
				},
				cancel : function(){
					alert('放弃分享');
				}
			}).emit();
		});
	</script>
</body>
</html>