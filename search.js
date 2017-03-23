//google search
(function(){
	function $(selector,parent){
		return parent?parent.querySelectorAll(selector):document.querySelectorAll(selector);
	}
	function checkDom(cssSelector,fn){
		var number=0;
		var timer=0;
		var finder;
		timer=setInterval(function(){
			if(number>=30)clearInterval(timer);
			number++;
			finder=$(cssSelector);
			if(finder.length>0){
				clearInterval(timer);
				typeof fn=="function"&&fn(finder);
			}
		},100);
	}
	var u=window.location.href;
	if(window.location.host.split(".")[1]=="google" && (u.indexOf("search?")>-1 || u.indexOf("webhp?")>-1) || u.indexOf("q=")>-1){
		var port = chrome.extension.connect({name: "search helper"});
		var ck={};
		var tmp_page=1;
		checkDom("#resultStats",function(dom){
			try{
				tmp_page=parseInt(dom[0].innerHTML.match(/\s\d+\s页/)[0],10);
			}catch(e){}
		});
		port.onMessage.addListener(function(data) {
			checkDom('.g',function(oDivs){
				if(data.type=="struts2"){
					if(data.status==1)console.log(data.content);
					struts2_tSpan=$(".struts2",$("._SWb",oDivs[data.num])[0])[0];
					if(struts2_tSpan){
						if(data.status==1){
							struts2_tSpan.innerHTML=data.type+"|"+data.st_num;
						}else{
							ck[data.num]=ck[data.num]?++ck[data.num]:1;
							if(ck[data.num]==2){
								struts2_tSpan.parentNode.removeChild(struts2_tSpan);
							}
						}
					}
				}else if(data.type=="httpcode"){
					//get httpcode
					tSpan=document.createElement('span');
					tSpan.innerHTML=data.code;
					tSpan.className="httpCode";
					oDivs[data.num]&&$("._SWb",oDivs[data.num])[0]&&$("._SWb",oDivs[data.num])[0].appendChild(tSpan);
					//get server
					tSpan=document.createElement('span');
					tSpan.innerHTML=data.server||"获取失败";
					tSpan.className="httpCode";
					oDivs[data.num]&&$("._SWb",oDivs[data.num])[0]&&$("._SWb",oDivs[data.num])[0].appendChild(tSpan);
				}else if(data.type=="nginxParse" && data.status==1){
					nginxParse_tSpan=document.createElement('span');
					nginxParse_tSpan.innerHTML="maybe|nginx_parse_bug";
					nginxParse_tSpan.className="httpCode";
					oDivs[data.num]&&$("._SWb",oDivs[data.num])[0]&&$("._SWb",oDivs[data.num])[0].appendChild(nginxParse_tSpan);
				}else if(data.type=="leakage"){
					if(!$("._SWb",oDivs[data.num])[0].querySelector("."+data.leakage_type)){
						leakage_tSpan=document.createElement('span');
						leakage_tSpan.innerHTML="maybe|"+data.leakage_type+"_leakage";
						leakage_tSpan.className="httpCode "+data.leakage_type;
						oDivs[data.num]&&$("._SWb",oDivs[data.num])[0]&&$("._SWb",oDivs[data.num])[0].appendChild(leakage_tSpan);
					}
				}else if(data.type=="redis"){

				}else if(data.type=="mysql"){

				}
			});
		});
		function google_helper(){
			checkDom('.g',function(oDivs){
				var url="";
				var tSpan=null;
				for(var i=0,len=oDivs.length;i<len;i++){
					tSpan=document.createElement('span');
					tSpan.innerHTML="检测struts2..";
					tSpan.className="struts2";
					$("._SWb",oDivs[i])[0]&&$("._SWb",oDivs[i])[0].appendChild(tSpan);
					//
					url=$("a",oDivs[i])[0].getAttribute("href");
					port.postMessage({url: url,num:i});
				}
			});
			//bind page click
			checkDom('#navcnt',function(dom){
				$("a",dom[0]).forEach(function(item){
					item.removeEventListener("click",reload_google_helper);
					item.addEventListener("click",function(){
						reload_google_helper();
					});
				});
			});
			//bind btn click
			checkDom("#_fZl",function(dom){
				dom[0].removeEventListener("click",reload_google_helper);
				dom[0].addEventListener("click",function(){
					reload_google_helper();
				});
			});
			//bind input 
			checkDom("#lst-ib",function(dom){
				dom[0].removeEventListener("keydown",reload_google_helper);
				dom[0].addEventListener("keydown",function(e){
					var ev=e || window.event;
					if(ev.keyCode==13){
						reload_google_helper();
					}
				});
			});
		}
		function reload_google_helper(){
			var t,n=0;
			clearInterval(t);
			t=setInterval(function(){
				if(n>200)clearInterval(t);
				++n;
				try{
					nowpage=parseInt($("#resultStats")[0].innerHTML.match(/\s\d+\s页/)[0],10);
				}catch(e){
					nowpage=1;
				}
				if(tmp_page!=nowpage){
					ck={};
					tmp_page=nowpage;
					clearInterval(t);
					google_helper();
				}
			},100);
		}
		google_helper();
	}
})();