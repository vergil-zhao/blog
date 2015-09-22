/**
 * Created by silence on 15/7/9.
 */

$(document).find("h1,h2").each(function(i,item){

    console.log(item);

    var tag = $(item).get(0).localName;
    $(item).attr("id","title_"+i);
    $("#AnchorContent").append('<li><a class="new'+tag+' anchor-link" href="#title_'+i+'">'+$(this).text()+'</a></li>');
    $(".newh1").css("margin-left",0);
    $(".newh2").css("margin-left",10);
    $(".newh3").css("margin-left",20);
    $(".newh4").css("margin-left",40);
    $(".newh5").css("margin-left",60);
    $(".newh6").css("margin-left",80);


});
$("#AnchorContentToggle").click(function(){
    var text = $(this).html();
    if(text=="Contents [-]"){
        $(this).html("Contents [+]");
        $(this).attr({"title":"展开"});
    }else{
        $(this).html("Contents [-]");
        $(this).attr({"title":"收起"});
    }
    $("#AnchorContent").toggle();
});