DBFX.RegisterNamespace("DBFX.Web.Controls");
DBFX.RegisterNamespace("DBFX.Web.NavControls");
DBFX.RegisterNamespace("DBFX.Design");
DBFX.RegisterNamespace("DBFX.Serializer");
DBFX.RegisterNamespace("DBFX.Design.ControlDesigners");


DBFX.Web.Controls.NotificationCenter = function () {
    var nc = new DBFX.Web.Controls.Control("NotificationCenter");
    nc.ClassDescriptor.Designers.splice(1, 0, "DBFX.Design.ControlDesigners.NotificationCenterDesigner");
    nc.ClassDescriptor.Serializer = "DBFX.Serializer.NotificationCenterSerializer";
    nc.VisualElement = document.createElement("DIV");
    nc.VisualElement.className = "NotificationCenter";
    nc.OnCreateHandle();
    nc.OnCreateHandle = function () {
        nc.Class = "NotificationCenter";
        nc.VisualElement.innerHTML = "<DIV class=\"NotificationCenterContainer\">" +
            "<IMG class=\"NotificationCenterImg\">" +
            "<SPAN class=\"NotificationCenterText\"></SPAN>" +
            "<SPAN class=\"NotificationCenterCount\"></SPAN>" +
            "</DIV>";
        nc.IconImg = nc.VisualElement.querySelector("IMG.NotificationCenterImg");
        nc.Title = nc.VisualElement.querySelector("SPAN.NotificationCenterText");
        nc.CountLabel = nc.VisualElement.querySelector("SPAN.NotificationCenterCount");

        nc.Container = nc.VisualElement.querySelector("DIV.NotificationCenterContainer");

        //FIXME:集成到平台需要更改路径
        nc.IconImg.src = "./notificationIcon.png";
        nc.CountLabel.textContent = "0";

        //绑定点击事件
        nc.Container.onmousedown = nc.OnClick;

        //创建PopupPanel，用于展示结果列表
        nc.ClientDiv = nc.VisualElement;
        //popupPanel
        nc.ResultPanel = new DBFX.Web.Controls.PopupPanel();

    }

    //属性设置定义
    //消息展示页面资源
    nc.resultResourceUri = "";
    Object.defineProperty(nc, "ResultResourceUri", {
        get: function () {
            return nc.resultResourceUri;
        },
        set: function (v) {
            nc.resultResourceUri = v;
        }
    });

    //图标图片
    nc.imageUrl = "";
    Object.defineProperty(nc, "ImageUrl", {
        get: function () {
            return nc.imageUrl;
        },
        set: function (v) {
            nc.imageUrl = v;
            //FIXME:
            if(v==""){
                nc.IconImg.src = "Themes/" + app.CurrentTheme + "/Images/NotificationCenter/notificationIcon.png";
            }else {
                nc.IconImg.src = v;
            }
        }
    });

    nc.countText = "0";
    Object.defineProperty(nc, "CountText", {
        get: function () {
            return nc.countText;
        },
        set: function (v) {
            nc.countText = v;
            nc.CountLabel.textContent = v;
        }
    });

    //TODO:定时器  定时刷新获取消息数量
    nc.timeId = setInterval(function () {


    },5000);

    nc.OnClick = function (e) {
        nc.OnSearchingFor(e);


    }

    //查询消息数据
    nc.OnSearchingFor = function (e) {

        console.log("查询消息");

        if (nc.Command != undefined && nc.Command != null) {
            nc.Command.Sender = nc;
            nc.Command.Execute();
        }

        if(nc.SearchingFor != undefined && nc.SearchingFor.GetType() == "Command"){
            nc.SearchingFor.Sender = nc;
            nc.SearchingFor.Execute();
        }

        if(nc.SearchingFor != undefined && nc.SearchingFor.GetType() == "function"){
            nc.SearchingFor(e,nc);
        }
    }

    nc.OnItemSelected = function () {
        if (nc.Command != undefined && nc.Command != null) {
            nc.Command.Sender = nc;
            nc.Command.Execute();
        }

        if(nc.ItemSelected != undefined && nc.ItemSelected.GetType() == "Command"){
            nc.ItemSelected.Sender = nc;
            nc.ItemSelected.Execute();
        }

        if(nc.ItemSelected != undefined && nc.ItemSelected.GetType() == "function"){
            nc.ItemSelected(e,nc);
        }

        //调用点击行事件后 应该关闭popUpPanel
        nc.ResultPanel.Close();
    }

    //页面资源是否加载
    nc.hasLoad = false;
    //展示搜索结果列表的方法  开发者在搜索事件里调用
    //obj对象包含数据列表Items 搜索到的数据集合
    nc.Show = function (obj) {

        if(nc.hasLoad == false){
            //PopUpPanel的属性FormContext赋值
            nc.ResultPanel.FormContext = {Form:nc.ResultPanel};
            nc.ResultPanel.FormControls = {};
            //TODO:加载页面资源
            DBFX.Resources.LoadResource(nc.resultResourceUri,function (ncv) {
                ncv.DataContext = obj;
                ncv.NotificationCenter = nc;
            },nc.ResultPanel);

            nc.hasLoad = true;
        }else {
            nc.ResultPanel.DataContext = obj;
            nc.ResultPanel.NotificationCenter = nc;
        }

        //展示结果界面
        nc.ResultPanel.Show(nc);
    }

    nc.OnCreateHandle();
    return nc;
}


DBFX.Serializer.NotificationCenterSerializer = function () {
    //系列化
    this.Serialize = function (c, xe, ns) {
        DBFX.Serializer.SerialProperty("ResultResourceUri", c.ResultResourceUri, xe);
        DBFX.Serializer.SerialProperty("ImageUrl", c.ImageUrl, xe);
        DBFX.Serializer.SerialProperty("CountText", c.CountText, xe);

        //序列化方法
        DBFX.Serializer.SerializeCommand("SearchingFor", c.SearchingFor, xe);
        DBFX.Serializer.SerializeCommand("ItemSelected", c.ItemSelected, xe);
    }

    //反系列化
    this.DeSerialize = function (c, xe, ns) {
        DBFX.Serializer.DeSerialProperty("ResultResourceUri", c, xe);
        DBFX.Serializer.DeSerialProperty("ImageUrl", c, xe);
        DBFX.Serializer.DeSerialProperty("CountText", c, xe);

        //对方法反序列化
        DBFX.Serializer.DeSerializeCommand("SearchingFor", xe, c);
        DBFX.Serializer.DeSerializeCommand("ItemSelected", xe, c);
    }

}
DBFX.Design.ControlDesigners.NotificationCenterDesigner = function () {

    var obdc = new DBFX.Web.Controls.GroupPanel();
    obdc.OnCreateHandle();
    obdc.OnCreateHandle = function () {
        DBFX.Resources.LoadResource("design/DesignerTemplates/FormDesignerTemplates/NotificationCenterDesigner.scrp", function (od) {
            od.DataContext = obdc.dataContext;
            //设计器中绑定事件处理
            od.EventListBox = od.FormContext.Form.FormControls.EventListBox;
            od.EventListBox.ItemSource = [{EventName:"SearchingFor",EventCode:undefined,Command:od.dataContext.SearchingFor,Control:od.dataContext},{EventName:"ItemSelected",EventCode:undefined,Command:od.dataContext.ItemSelected,Control:od.dataContext}];
        }, obdc);
    }

    //事件处理程序
    obdc.DataContextChanged = function (e) {
        obdc.DataBind(e);
        if(obdc.EventListBox != undefined){
            obdc.EventListBox.ItemSource = [{EventName:"SearchingFor",EventCode:undefined,Command:obdc.dataContext.SearchingFor,Control:obdc.dataContext},{EventName:"ItemSelected",EventCode:undefined,Command:obdc.dataContext.ItemSelected,Control:obdc.dataContext}];
        }
    }

    obdc.HorizonScrollbar = "hidden";
    obdc.OnCreateHandle();
    obdc.Class = "VDE_Design_ObjectGeneralDesigner";
    obdc.Text = "通知中心";
    return obdc;
}