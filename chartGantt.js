/**
 * Created by Marina on 10.10.2016.
 */
var Chart={
    /**
     * Количество всех ячеек в графике
     */
    countWorkCells: 0,
    /**
     *Ширина ячейки
     */
    widthCells: 0,
    /**
     * Ширина границы
     */
    borderWidth: 0,
    /**
     * Массив работ
     */
    arrayWork: [],
    /**
     * Дата начала графика
     */
    dtBeg: 0,
    /**
     * Дата окончания графика
     */
    dtEnd: 0,
    /**
     * Период - сколько дней в одной ячейки
     */
    periodDays: 0,
    /**
     * Функция, которая загружает данные из json
     * @param filename Наименование файла json
     */
    loadJSON: function (filename) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET',filename, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                Chart.setConfig(xobj.responseText);
            }
        }
        xobj.send(null);
    },
    /**
     * Функция, инициализирующая график
     */
    init: function () {
        this.loadJSON("in_data.json");
    },
    /**
     * Функция, которая устанавливает все базовые настройки графика
     * @param sendStr
     */
    setConfig: function(sendStr){
        var configStr=sendStr;

        inDataChart = JSON.parse(configStr, function(key, value) {
            if ((key == "DT_beg")|| (key=="DT_end")|| (key == "DT_begChart")|| (key=="DT_endChart")) { return new Date(value); }

            return value;
        });

        var configChart =inDataChart.SetupChart;
        var countDays=(configChart.DT_endChart.getTime()-configChart.DT_begChart.getTime())/(1000*60*60*24);

        Chart.countWorkCells=countDays/configChart.period_Days;
        Chart.widthCells=configChart.width_Cell;
        Chart.borderWidth=configChart.borderWidth;
        Chart.dtBeg=configChart.DT_begChart;
        Chart.dtEnd=configChart.DT_endChart;
        Chart.periodDays=configChart.period_Days;
        Chart.arrayWork=inDataChart.arrayData;

        var arr=Chart.arrayWork;
        arr.forEach(function (item, i, arr) {
            var arrayChildWork = item.childWork;
            if (arrayChildWork != null) {
                Chart.addRow(item.IdWork, item.NaimWork, true);
                Chart.addRowWork(item.IdWork, 0);
                Chart.addCellWork("rowW_" + item.IdWork, 'gantt_work_cell');
                Chart.addWorkCh("rowW_" + item.IdWork, arrayChildWork);
                Chart.recurseChild(arrayChildWork, item);
            } else {
                Chart.addRow(item.IdWork, item.NaimWork, false);
                Chart.addRowWork(item.IdWork, 0);
                Chart.addCellWork("rowW_" + item.IdWork, 'gantt_work_cell');
                Chart.addWork("rowW_" + item.IdWork, item.DT_beg, item.DT_end, item.color, item.NaimWork);
            }
        });
        this.addDate();
        this.drawingRow();
    },
    /**
     * Добавляет все подчиненные работы
     * @param idRow
     * @param arrayCh
     */
    addWorkCh: function(idRow, arrayCh){
        for (var i = 0; i < arrayCh.length; ++i) {
            this.addWork(idRow, arrayCh[i].DT_beg, arrayCh[i].DT_end, arrayCh[i].color, arrayCh[i].NaimWork);
        }
    },
    /**
     * Добавляет работу
     * @param idRow
     * @param dt_begWork
     * @param dt_endWork
     * @param color
     * @param naim
     */
    addWork: function (idRow, dt_begWork, dt_endWork, color, naim) {
        var countDays=(this.dtEnd.getTime()-this.dtBeg.getTime())/(1000*60*60*24);

        var widthDay=this.widthCells/this.periodDays;

        var beg1=this.dtBeg.getTime();
        var beg2=dt_begWork.getTime();
        var end1=this.dtEnd.getTime();

        if (beg2>=beg1 && beg2<=end1) {
            var differDays=(dt_begWork.getTime()-beg1)/(1000*60*60*24);
            var dayWork=(dt_endWork.getTime()-dt_begWork.getTime())/(1000*60*60*24);

            var countCellsleft=differDays/this.periodDays;
            var countCellswidth=dayWork/this.periodDays;

            var widthWork=dayWork*widthDay+countCellswidth*this.borderWidth;
            var leftWork=differDays*widthDay+countCellsleft*this.borderWidth;

            var rowWork=document.getElementById(idRow);

            var newWork= document.createElement('div');
            newWork.className = 'gantt_work_real';
            newWork.style.width=widthWork+"px";
            newWork.style.left=leftWork+"px";
            newWork.innerHTML =naim;
            newWork.style.backgroundColor=color;
            newWork.id = "dateWork_"+idRow;
            rowWork.appendChild(newWork);
        }
    },
    /**
     * Добавляет данные к осям графика
     */
    addDate: function () {
        var ganttWork=document.getElementById("gantt_work");

        var new_rowHeader= document.createElement('div');
        new_rowHeader.className='gantt_date_data';
        new_rowHeader.style.display='block';
        new_rowHeader.id = "dateRowWork";
        ganttWork.appendChild(new_rowHeader);

        var new_row= document.createElement('div');
        new_row.className = 'gantt_date_row';
        new_row.id = "dateRow";
        new_rowHeader.appendChild(new_row);
        new_row.style.width=this.widthCells*this.countWorkCells+this.borderWidth*this.countWorkCells+"px";

        var month = ['Янв','Фев','Март','Апр','Мая','Июн',
            'Июл','Авг','Сент','Окт','Нояб','Дек'];

        var new_cell=null;
        var dt_beg=this.dtBeg;

        for (var i = 0; i < this.countWorkCells; ++i) {
            new_cell= document.createElement('div');
            new_cell.style.display='block';
            new_cell.style.width=this.widthCells+"px";
            new_cell.id = "cellDate_"+i;
            new_cell.className="gantt_date_cell";

            if (i>0) dt_beg.setDate(dt_beg.getDate()+this.periodDays);

            new_cell.innerHTML=month[dt_beg.getMonth()]+" "+dt_beg.getDate();
            new_row.appendChild(new_cell);
            new_cell=null;
        }
    },
    /**
     * Добавляет строки работ к графику
     * @param id_new
     * @param id_Parent
     */
    addRowWork: function (id_new, id_Parent) {
        var ganttWork=document.getElementById("gantt_work");

        var new_rowHeader= document.createElement('div');
        new_rowHeader.className='gantt_work_data';
        new_rowHeader.style.display='block';
        new_rowHeader.id = "gridW_"+id_new;

        if (id_Parent!=0) {
            new_rowHeader.style.display='none';
            new_rowHeader.setAttribute("IdParent", "grid_"+id_Parent);
        } else {
            new_rowHeader.style.display='block';
        }

        ganttWork.appendChild(new_rowHeader);

        var new_row= document.createElement('div');
        new_row.className = 'gantt_work_row';
        new_row.id = "rowW_"+id_new;
        new_rowHeader.appendChild(new_row);
    },
    /**
     * Добавляет ячейки к графику
     * @param idRow
     * @param classWork
     */
    addCellWork: function (idRow, classWork){
        var rowWork=document.getElementById(idRow);
        rowWork.style.width=this.widthCells*this.countWorkCells+this.borderWidth*this.countWorkCells+"px";

        var new_cell=null;
        for (var i = 0; i < this.countWorkCells; ++i) {
            new_cell= document.createElement('div');
            new_cell.className=classWork;
            new_cell.style.display='block';
            new_cell.id = "cellW_"+idRow+"_"+i;
            new_cell.style.width=this.widthCells+"px";

            rowWork.appendChild(new_cell);
            new_cell=null;
        }
    },
    /**
     * Рекурсивная функция для добавления древовидности
     * @param arrayChildWork
     * @param item
     */
    recurseChild: function (arrayChildWork, item) {
        arrayChildWork.forEach(function(itemCh, j, arrayChildWork) {
            if (itemCh.childWork!=null) {
                Chart.addRowChild(itemCh.IdWork, itemCh.NaimWork, "grid_"+item.IdWork, true);
                Chart.addRowWork(itemCh.IdWork,item.IdWork);
                Chart.addCellWork("rowW_"+itemCh.IdWork, 'gantt_work_cell');
                Chart.addWorkCh("rowW_"+itemCh.IdWork, itemCh.childWork);
                Chart.recurseChild(itemCh.childWork, itemCh);
            } else {
                Chart.addRowChild(itemCh.IdWork, itemCh.NaimWork, "grid_"+item.IdWork, false);
                Chart.addRowWork(itemCh.IdWork,item.IdWork);
                Chart.addCellWork("rowW_"+itemCh.IdWork, 'gantt_work_cell');
                Chart.addWork("rowW_"+itemCh.IdWork, itemCh.DT_beg, itemCh.DT_end, itemCh.color, itemCh.NaimWork);
            }
        });
    },
    /**
     * Добавляет строку с подписью наименования работы
     * @param id_new
     * @param name_new
     * @param isParent
     */
    addRow: function (id_new, name_new, isParent) {
        var leftSide=document.getElementById("gantt_leftside");

        var new_rowHeader= document.createElement('div');
        new_rowHeader.className='gantt_grid_data';
        new_rowHeader.style.display='block';
        new_rowHeader.id = "grid_"+id_new;
        leftSide.appendChild(new_rowHeader);

        var new_row= document.createElement('div');
        new_row.className = 'gantt_cell_header';
        new_row.id = "cellH_"+id_new;
        new_row.innerHTML=name_new;
        new_rowHeader.appendChild(new_row);

        if (isParent) {
            var plus= document.createElement('div');
            plus.className = 'plus';
            plus.id = "plus_"+id_new;
            plus.innerHTML="+";
            new_row.appendChild(plus);
            plus.setAttribute('onclick', "if (this.innerHTML==\"+\") {this.innerHTML=\"-\";Chart.openChild("+id_new+");} else {this.innerHTML=\"+\";Chart.closeChild(\"grid_"+id_new+"\");}");
        }
    },
    /**
     * Добавляет подчиненную строку
     * @param id_new
     * @param name_new
     * @param id_Parent
     * @param isParent
     */
    addRowChild: function (id_new, name_new, id_Parent, isParent) {
        var Parent_elem=document.getElementById(id_Parent);

        var new_rowHeader= document.createElement('div');
        new_rowHeader.className='gantt_grid_dataCh';
        new_rowHeader.style.display='none';
        new_rowHeader.setAttribute("IdParent", id_Parent);
        new_rowHeader.id = "grid_"+id_new;
        Parent_elem.appendChild(new_rowHeader);

        var new_row= document.createElement('div');
        new_row.className = 'gantt_cell_child';
        new_row.id = "cellH_"+id_new;
        new_row.innerHTML=name_new;
        new_rowHeader.appendChild(new_row);

        if (isParent) {
            var plus= document.createElement('div');
            plus.className = 'plus';
            plus.id = "plus_"+id_new;
            plus.innerHTML="+";
            new_row.appendChild(plus);
            plus.setAttribute('onclick', "if (this.innerHTML==\"+\") {this.innerHTML=\"-\";Chart.openChild("+id_new+");} else {this.innerHTML=\"+\";Chart.closeChild(\"grid_"+id_new+"\");}");
        }
    },
    /**
     * Событие открытия узла в дереве
     * @param idParent
     */
    openChild: function (idParent) {
        var selector="div[IdParent='grid_"+idParent+"']";
        var elements = document.querySelectorAll(selector);
        var plus=document.getElementById("plus_"+idParent);
        for (var i = 0; i < elements.length; ++i) {
            elements[i].style.display='block';
        }
    },
    /**
     * Событие закрытия узла в дереве
     * @param idParent
     */
    closeChild: function (idParent){
        var selector="div[IdParent="+idParent+"]";
        var elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i].style.display!='none') {
                selector="div[IdParent=\""+elements[i].id+"\"]";

                var elementsChild = document.querySelectorAll(selector);

                var idElem=elements[i].id;
                var strId=idElem.substr(idElem.indexOf("_")+1);

                var plus=document.getElementById("plus_"+strId);
                if (elementsChild.length>0 && plus.innerHTML=="-") {
                    plus.innerHTML="+";
                    elements[i].style.display='none';
                    Chart.closeChild("grid_"+strId);
                }
                elements[i].style.display='none';
            }
        }
    },
    /**
     * Функция, которая рисует строки
     */
    drawingRow: function () {
        var selector=".gantt_grid_data";
        var elements = document.querySelectorAll(selector);

        var backgColor="";
        var bordColor="";

        for (var i = 0; i < elements.length; ++i) {

            if (i%2==0) {
                backgColor="white";
                bordColor="#d4d4d4";
            } else {
                backgColor="#e6e6e6";
                bordColor="white";
            }

            elements[i].children[0].style.backgroundColor=backgColor;
            elements[i].children[0].style.borderTop="1px solid #d4d4d4";
            elements[i].children[0].style.borderBottom="1px solid #d4d4d4";
            elements[i].children[0].style.borderRight="1px solid "+bordColor;

            var strId=elements[i].id;
            strId=strId.substring(strId.indexOf("_")+1);

            var rowWork=document.getElementById("rowW_"+strId);
            rowWork.style.backgroundColor=backgColor;

            for (var j = 0; j < rowWork.children.length; ++j) {
                if (j==0)  {elements[i].children[0].style.borderLeft="1px solid "+bordColor;}
                rowWork.children[j].style.borderLeft="1px solid "+bordColor;
                rowWork.children[j].style.borderTop="1px solid #d4d4d4";
                rowWork.children[j].style.borderBottom="1px solid #d4d4d4";
            }
        }
    }
}
