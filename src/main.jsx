var React=require("react");
var ReactDOM=require("react-dom");
var CodeMirror=require("ksana-codemirror").Component;
var file1=require("./001-001");
var Maincomponent = React.createClass({
	getInitialState:function() {
		return {data:file1,pageid:"1.1a"}
	}
	,prevline:-1
	,PBLINE:[]
	,imageLoaded:function() {
		var imageheight=ReactDOM.findDOMNode(this.refs.image).offsetHeight;
		this.refs.cm.getCodeMirror().setSize(null,document.body.offsetHeight-imageheight);
	}
	,componentDidMount:function() {
		this.cm=this.refs.cm.getCodeMirror();//codemirror instance
		this.doc=this.cm.getDoc();
		this.markAllTag();
	}
	,buildPBLINE:function() {
		var marks=this.doc.getAllMarks();
		this.PBLINE=[];
		for (var i=0;i<marks.length;i++) {
			var m=marks[i];
			if (m.replacedWith.className=="pbmarker") {
				var pos=m.find();
				this.PBLINE.push([pos.from.line,m.replacedWith.innerHTML]);
			}
		}
		this.PBLINE.sort(function(a,b){
			return a[0]-b[0];
		});
	}
	,getPageIdByLine:function(line) {
		for (var i=1;i<this.PBLINE.length;i++) {
			var pbline=this.PBLINE[i];
			if (pbline[0]>line) {
				return this.PBLINE[i-1][1];
			}
		}
		return "1.1a";//default
	}
	,pageId2filename:function(pageid) {
		var m=this.state.pageid.match(/(\d+)\.(\d+[abcd])/);
		var vol="00"+m[1], pg="00"+m[2];
		vol=vol.substr(vol.length-3);
		pg=pg.substr(pg.length-4);
		return "images/"+vol+"/"+vol+"-"+pg+".jpg";
	}
	,createMarker:function(tag) {
		var element=document.createElement("SPAN");
		if (tag.substr(0,2)=="pb") {
			var id=tag.match(/"(.*?)"/);
			element.className="pbmarker";
			element.innerHTML=id[1];
		}else {
			element.className="tagmarker";	
			element.innerHTML="<>";			
		}
		return element;
	}
	,markLineTag:function(i,rebuild) {
		var line=this.doc.getLine(i);
		var dirty=false;
		line.replace(/<(.*?)>/g,function(m,m1,idx){
			var element=this.createMarker(m1);
			if (m1.substring(0,2)==="pb") dirty=true;
			this.doc.markText({line:i,ch:idx},{line:i,ch:idx+m.length},
				{clearOnEnter:true,replacedWith:element});
		}.bind(this));
		setTimeout(function(){
			if (rebuild && dirty) this.buildPBLINE();
		}.bind(this),100);//<pb id="1.2b"/>
	}
	,markAllTag:function() {
		for (var i=0;i<this.doc.lineCount();i++){
			this.markLineTag(i);
		}
		this.buildPBLINE();
	}
	,onCursorActivity:function(cm) {
		var pos=cm.getCursor();
		if (this.prevline>-1 && pos.line!==this.prevline) {
			this.markLineTag(this.prevline,true);
			var pageid=this.getPageIdByLine(pos.line);
			this.setState({pageid:pageid});
		}
		this.prevline=pos.line;
	}
  ,render: function() {
    return <div>
      <CodeMirror ref="cm" value={this.state.data} onCursorActivity={this.onCursorActivity}/>
    	<img ref="image" src={this.pageId2filename()} onLoad={this.imageLoaded}/>
    </div>;
  }
});
module.exports=Maincomponent;