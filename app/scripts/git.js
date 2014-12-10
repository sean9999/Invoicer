$(function(){
	$.getJSON('/datas/git',function(result){
		$('#').html( JSON.stringify(result) );
	});
});