//функция для загрузки строки из json файла
function loadJSON(filename,callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET',filename, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") 
		  {
           callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }
 //функция формирования графика из json файла
function add_chart(){
		
		loadJSON("in_data.json",function (sendStr){
			var configStr=sendStr;
			 inDataChart = JSON.parse(configStr, function(key, value) {
                                                   if ((key == "DT_beg")|| (key=="DT_end")|| (key == "DT_begChart")|| (key=="DT_endChart")) 
												   { return new Date(value);}
											   
			                                            return value;});
			//данные по настройки графика
			var configChart =inDataChart.SetupChart;
			var countDays=(configChart.DT_endChart.getTime()-configChart.DT_begChart.getTime())/(1000*60*60*24);//
			
			countWorkCells=countDays/configChart.period_Days;
			widthCells=configChart.width_Cell;
			borderWidth=configChart.borderWidth;
			
			//данные по работам
			var arrayWork=inDataChart.arrayData;
			console.log(arrayWork);
			arrayWork.forEach(function(item, i, arrayWork)
			{
               	var arrayChildWork=item.childWork;
				if (arrayChildWork!=null)
				{
					add_row(item.IdWork,item.NaimWork,true);
					add_rowWork(item.IdWork,0,true,false);
					add_cellWork("rowW_"+item.IdWork,countWorkCells,widthCells,borderWidth,'gantt_work_cell');
				    add_WorkCh("rowW_"+item.IdWork, configChart.DT_begChart, configChart.DT_endChart, widthCells,borderWidth,configChart.period_Days,arrayChildWork);
					recurse_Child(arrayChildWork,item,countWorkCells,widthCells,borderWidth,configChart.period_Days,configChart.DT_begChart,configChart.DT_endChart);					
				} else {
						add_row(item.IdWork,item.NaimWork,false);
						add_rowWork(item.IdWork,false,false);
						add_cellWork("rowW_"+item.IdWork,countWorkCells,widthCells,borderWidth,'gantt_work_cell');
						add_Work("rowW_"+item.IdWork, configChart.DT_begChart, configChart.DT_endChart, item.DT_beg, item.DT_end, widthCells,borderWidth, item.color,configChart.period_Days,item.NaimWork);
						}
			});
			add_date(configChart.DT_begChart,configChart.DT_endChart,configChart.period_Days,countWorkCells,widthCells,borderWidth);
			drawing_row();
        });
}
function add_WorkCh(idRow, dt_beg_all, dt_end_all, widthCells,borderWidth,periodDay,arrayCh){
	for (i = 0; i < arrayCh.length; ++i) {
		 add_Work(idRow, dt_beg_all, dt_end_all, arrayCh[i].DT_beg, arrayCh[i].DT_end, widthCells,borderWidth, arrayCh[i].color,periodDay,arrayCh[i].NaimWork);
	}
}
function add_Work(idRow, dt_beg_all, dt_end_all, dt_begWork, dt_endWork, widthCells,borderWidth, color,periodDay,naim){
	
	//вычислить left дива для работы
	var countDays=(dt_end_all.getTime()-dt_beg_all.getTime())/(1000*60*60*24);
	var countWorkCells=countDays/periodDay;
	var widthDay=widthCells/periodDay;
	
	var beg1=dt_beg_all.getTime();
	var beg2=dt_begWork.getTime();
	var end1=dt_end_all.getTime();
	
	if ((beg2>=beg1) && (beg2<=end1))
	    {
		 var differDays=(dt_begWork.getTime()-dt_beg_all.getTime())/(1000*60*60*24);
		 var dayWork=(dt_endWork.getTime()-dt_begWork.getTime())/(1000*60*60*24);
		 var countCellsleft=differDays/periodDay;
		 var countCellswidth=dayWork/periodDay;
		 
		 var widthWork=dayWork*widthDay+countCellswidth*borderWidth;
		 var leftWork=differDays*widthDay+countCellsleft*borderWidth;
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
}
function add_date(dt_beg,dt_end,period,countCells,widthCells,borderWidth){
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
	var new_cell=null;
	 var month = ['Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'];
     
	new_row.style.width=widthCells*countCells+borderWidth*countCells+"px";
	for (i = 0; i < countCells; ++i) {
	        new_cell= document.createElement('div');
			new_cell.className="gantt_date_cell";
			new_cell.style.display='block';
			new_cell.id = "cellDate_"+i;
			new_cell.style.width=widthCells+"px";
			
			if (i>0) dt_beg.setDate(dt_beg.getDate()+period);
			
			new_cell.innerHTML=month[dt_beg.getMonth()]+" "+dt_beg.getDate();
		new_row.appendChild(new_cell);	
		new_cell=null;
	}
}
function add_rowWork(id_new,id_Parent,isParent,isChild){
	var ganttWork=document.getElementById("gantt_work");
	var new_rowHeader= document.createElement('div');
		new_rowHeader.className='gantt_work_data';
		new_rowHeader.style.display='block';
		new_rowHeader.id = "gridW_"+id_new;
		if (isChild)
		   {
			   new_rowHeader.style.display='none';
			   new_rowHeader.setAttribute("IdParent", "grid_"+id_Parent);
		   }
	    else new_rowHeader.style.display='block'; 
	ganttWork.appendChild(new_rowHeader);
	var new_row= document.createElement('div');
	    new_row.className = 'gantt_work_row';
        new_row.id = "rowW_"+id_new;
	new_rowHeader.appendChild(new_row);
}
function add_cellWork(idRow,countCells,widthCells,borderWidth,classWork){
	var rowWork=document.getElementById(idRow);
	var new_cell=null;
	rowWork.style.width=widthCells*countCells+borderWidth*countCells+"px";
	for (i = 0; i < countCells; ++i) {
	        new_cell= document.createElement('div');
			new_cell.className=classWork;//'gantt_work_cell'
			new_cell.style.display='block';
			new_cell.id = "cellW_"+idRow+"_"+i;
			new_cell.style.width=widthCells+"px";
			
		rowWork.appendChild(new_cell);	
		new_cell=null;
	}
	
	//new_cell.appendChild(new_row);
}
function recurse_Child(arrayChildWork,item,countWorkCells,widthCells,borderWidth,periodDay,dt_beg_all, dt_end_all){
	arrayChildWork.forEach(function(itemCh, j, arrayChildWork){
					                      if (itemCh.childWork!=null)
										     { 
										      add_rowChild(itemCh.IdWork,itemCh.NaimWork,"grid_"+item.IdWork,true);
											  add_rowWork(itemCh.IdWork,item.IdWork,true,true);
											  add_cellWork("rowW_"+itemCh.IdWork,countWorkCells,widthCells,borderWidth,'gantt_work_cell');
											  add_WorkCh("rowW_"+itemCh.IdWork, dt_beg_all, dt_end_all, widthCells,borderWidth,periodDay,itemCh.childWork);
											  recurse_Child(itemCh.childWork,itemCh,countWorkCells,widthCells,borderWidth,periodDay,dt_beg_all, dt_end_all);
											  }
										  else { 
											    add_rowChild(itemCh.IdWork,itemCh.NaimWork,"grid_"+item.IdWork,false);
											    add_rowWork(itemCh.IdWork,item.IdWork,false,true);
												add_cellWork("rowW_"+itemCh.IdWork,countWorkCells,widthCells,borderWidth,'gantt_work_cell');
												add_Work("rowW_"+itemCh.IdWork, dt_beg_all, dt_end_all, itemCh.DT_beg, itemCh.DT_end, widthCells,borderWidth, itemCh.color,periodDay,itemCh.NaimWork);
										       }
				                            });
}
function add_row(id_new,name_new,isParent){
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
	if (isParent)
		{
		var plus= document.createElement('div');
	    plus.className = 'plus';
        plus.id = "plus_"+id_new;
		plus.innerHTML="+";
		new_row.appendChild(plus);
		plus.setAttribute('onclick', "if (this.innerHTML==\"+\") {this.innerHTML=\"-\";open_child("+id_new+");} else {this.innerHTML=\"+\";close_child(\"grid_"+id_new+"\");}");
		}
}
function add_rowChild(id_new,name_new,id_Parent,isParent){
	
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
	if (isParent)
		{
		var plus= document.createElement('div');
	    plus.className = 'plus';
        plus.id = "plus_"+id_new;
		plus.innerHTML="+";
		new_row.appendChild(plus);
		plus.setAttribute('onclick', "if (this.innerHTML==\"+\") {this.innerHTML=\"-\";open_child("+id_new+");} else {this.innerHTML=\"+\";close_child(\"grid_"+id_new+"\");}");
		}
}
function open_child(idParent){
	var selector="div[IdParent=\"grid_"+idParent+"\"]";
	var elements = document.querySelectorAll(selector);
	var plus=document.getElementById("plus_"+idParent);
	for (i = 0; i < elements.length; ++i) {
            elements[i].style.display='block';
        }
	
	
}
function close_child(idParent){
	var selector="div[IdParent="+idParent+"]";
	var elements = document.querySelectorAll(selector);
	for (i = 0; i < elements.length; ++i) {
             if (elements[i].style.display!='none')
			 {
				selector="div[IdParent=\""+elements[i].id+"\"]";
				var elementsChild = document.querySelectorAll(selector);
				var idElem=elements[i].id;
				var strId=idElem.substr(idElem.indexOf("_")+1); 
				var plus=document.getElementById("plus_"+strId);
				if (elementsChild.length>0)
					{
						if (plus.innerHTML=="-")
							{
							 plus.innerHTML="+";
							 elements[i].style.display='none';
						     close_child("grid_"+strId);
							}
					}
				elements[i].style.display='none';
				}
		}
}
function drawing_row(){
	var selector=".gantt_grid_data";//,.gantt_grid_dataCh .gantt_work_data,
	var elements = document.querySelectorAll(selector);
	for (i = 0; i < elements.length; ++i) {
             if (i%2==0)
			 {
				elements[i].children[0].style.backgroundColor="white";
				//if (i>0)
				{
				 elements[i].children[0].style.borderTop="1px solid #d4d4d4";
                
				 elements[i].children[0].style.borderRight="1px solid #d4d4d4";
				}
				//if (i==elements.length-1)  
					elements[i].children[0].style.borderBottom="1px solid #d4d4d4";
				 var strId=elements[i].id;
					 strId=strId.substring(strId.indexOf("_")+1);
				var rowWork=document.getElementById("rowW_"+strId);
				    rowWork.style.backgroundColor="white";
				 
				  //rowW_2 - строка работы - cellH_2 - соответсвующая ей строка-заголовок
				  for (j = 0; j < rowWork.children.length; ++j) {
					  if (j==0)  {elements[i].children[0].style.borderLeft="1px solid #d4d4d4";}
					  rowWork.children[j].style.borderLeft="1px solid #d4d4d4";
					  rowWork.children[j].style.borderTop="1px solid #d4d4d4";
				      rowWork.children[j].style.borderBottom="1px solid #d4d4d4";
					 
				 }
			 }
			 else {
				 elements[i].children[0].style.backgroundColor="#e6e6e6";
				 elements[i].children[0].style.borderTop="1px solid #d4d4d4";
                 //if (i==elements.length-1)  
					 elements[i].children[0].style.borderBottom="1px solid #d4d4d4";
				 elements[i].children[0].style.borderRight="1px solid white";
				 var strId=elements[i].id;
					 strId=strId.substring(strId.indexOf("_")+1);
				 var rowWork=document.getElementById("rowW_"+strId);
				 rowWork.style.backgroundColor="#e6e6e6";
				 
				  //rowW_2 - строка работы - cellH_2 - соответсвующая ей строка-заголовок
				 for (j = 0; j < rowWork.children.length; ++j) {
					  rowWork.children[j].style.borderLeft="1px solid white";
					  rowWork.children[j].style.borderTop="1px solid #d4d4d4";
				      rowWork.children[j].style.borderBottom="1px solid #d4d4d4";
					 
				 }
			 }
		}
}