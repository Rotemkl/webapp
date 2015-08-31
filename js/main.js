$(document).ready(function() {

	const QUICK_REPORTS = 0;
	const MY_FOLDERS = 1;
	const MY_TEAM_FOLDERS = 2;
	const PUBLIC_FOLDERS = 3;
	const NO_OPEN_TAB = 4;
	const TAB_LIST = ['quick-reports', 'my-folders', 'my-team-folders', 'public-folders'];
	const SITE_TABS = [ 'FirstTab', 'SecondTab', 'ThirdTab'];
	var CurrentTab = NO_OPEN_TAB; 		
	var TabList = $(".tabs li");
	var TabSection = $(".tabs .tab");
	
	
	function GetStorage()
	{
		var Storage = localStorage.getItem("webapp");
		if( Storage == null )
		{
			localStorage.setItem( "webapp", JSON.stringify({}) );			
			Storage = localStorage.getItem("webapp");
		}
		return JSON.parse(Storage);
	}
		
	function UpdateStorage( SiteValue, TabName )
	{
		var Storage = GetStorage(); 
		Storage[TabName] = SiteValue;
		localStorage.setItem("webapp", JSON.stringify(Storage));
	}
	
	function LoadSite()
	{
		var Storage = GetStorage();		
		// There is no storage
		if(Storage == {})
		{
			location.hash = TAB_LIST[0];
			return;
		}

		if(Storage.LastTab == undefined)
		{
			// open first tab
			location.hash = TAB_LIST[0];
		}
		else	
		{
			// open last active tab
			location.hash = TAB_LIST[Storage.LastTab];
		}

		// There is storage in the first tab
		if(Storage["FirstTab"].length > 0)
		{
			SitesList = $("#FirstList fieldset");
			for (var i = 0; i < Storage["FirstTab"].length; i++) 
			{
				var SiteValue = $(SitesList[i]).find("input");
				SiteValue[0].value = Storage["FirstTab"][i].site;
				SiteValue[1].value = Storage["FirstTab"][i].url;
			};
			UpdateSitesTab(QUICK_REPORTS);
		}

		// There is storage in the third tab
		if(Storage["ThirdTab"].length > 0)
		{
			SitesList = $("#SecondList fieldset");
			for (var i = 0; i < Storage["ThirdTab"].length; i++) 
			{
				var SiteValue = $(SitesList[i]).find("input");
				SiteValue[0].value = Storage["ThirdTab"][i].site;
				SiteValue[1].value = Storage["ThirdTab"][i].url;
			};
			UpdateSitesTab(MY_TEAM_FOLDERS);
		}
	}
	
	
	function SaveSites( SitesForm )
	{ 
		var ValidEntry = [];
		var EntryFlag = false;
		var SitesList = $(SitesForm).find(".enter-site"); 

		for (var i = 0; i < SitesList.length; i++) 
		{
			var Entry = $(SitesList[i]).find("input");
			
			SiteEntry = $(Entry[0]);
			URLEntry = $(Entry[1]);
			
			Name = Entry[0];
			URL = Entry[1];
			
			// both entries are not empty
			if( SiteEntry.val() != "" && URLEntry.val() != "" ) 
			{
				EntryFlag = true;
				// add http:// if doesn't exist
				if( !URL.value.match("^http") )
				{
					var SiteName = 'http://' + URL.value;
				}
				else
				{
					var SiteName = URL.value;
				}
				
				// check url validity
				var url_validate = /^(http:\/\/www\.|https:\/\/www\.)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
				if(!url_validate.test(SiteName))
				{
					alert('invalid URL');
					URLEntry.addClass('red-border');
					return;
				}

				ValidEntry.push({'site':Name.value, 'url':SiteName});
				SiteEntry.removeClass('red-border');
				URLEntry.removeClass('red-border');
			}		
			
			// one of the entries is empty
			if( SiteEntry.val() != "" && URLEntry.val() == "" ) 
			{
				SiteEntry.removeClass('red-border');
				URLEntry.addClass('red-border');
				URL.focus();
				return;
			}
			if( SiteEntry.val() == "" && URLEntry.val() != "" ) 
			{
				URLEntry.removeClass('red-border');
				SiteEntry.addClass('red-border');
				Name.focus();
				return;
			}						
		};

		UpdateStorage( ValidEntry, SITE_TABS[CurrentTab] );			
		if(EntryFlag) 
		{
			UpdateSitesTab(CurrentTab); 
			var TabSelect = $('#' + (TAB_LIST[CurrentTab]));			
		}
		else
		{ 
			var TabSelect = $('#' + (TAB_LIST[CurrentTab]));
			TabSelect.find("iframe").hide(); 
			TabSelect.find("select").hide();
			TabSelect.find(".expand").hide(); 
		}
		
		
	}


	function UpdateSitesTab(TabNumber)
	{
		var Storage = GetStorage();
		var TabSelect = $('#' + (TAB_LIST[TabNumber]));
		var SiteValue = Storage[SITE_TABS[TabNumber]];	
		var SelectFlag = true; 

		if( TabSelect.find("select").length > 0 )
		{
			Value = TabSelect.find("select")[0];
		}
		else
		{
			Value = document.createElement("select"); 
			SelectFlag = false;
		}

		for(var i = Value.options.length-1; i >= 0; i--) 
		{
			Value.remove(i);
		}

		for (var i = 0; i < SiteValue.length; i++)
		{
			var Site = document.createElement("option");
			Site.value = SiteValue[i].url;
			Site.innerHTML = SiteValue[i].site;
			Value.add(Site);
		};

		if(!SelectFlag)
		{
			TabSelect.find(".inside-tabs").prepend(Value);
			TabSelect.find("select").change(function()
			{
				var TabSelect = $('#' + (TAB_LIST[CurrentTab]));
				var Selected = TabSelect.find("select option:selected");
				TabSelect.find("iframe")[0].src = Selected.val();
			});
		}

		if(TabSelect.find("iframe").length > 0)
		{
			TabIframe = TabSelect.find("iframe")[0];		
		}
		else
		{
			TabIframe = document.createElement("iframe");
			TabSelect.find(".tab-iframe").append(TabIframe);			
		}

		TabIframe.src = SiteValue[0].url;
		TabSelect.find(".expand").show();
		TabSelect.find(".list-form").hide(); 
	}
	
		
	function InputSearch(Input)
	{
		var InputExists = false;
		
		// search in the first tab
		if( SearchTab(Input, 'FirstTab') != -1 )
		{
			InputExists = true;
			var SiteNumber = SearchTab(Input, 'FirstTab');
			var TabNumber = QUICK_REPORTS;
		}
		// search in the third tab
		else if( SearchTab(Input, 'ThirdTab') != -1 )
		{
			InputExists = true;
			var SiteNumber = SearchTab(Input, 'ThirdTab');
			var TabNumber = MY_TEAM_FOLDERS;
		}

		// input was found 
		if(InputExists) 
		{
			location.hash = TAB_LIST[TabNumber]; 
			var TabSelect = $('#' + (TAB_LIST[TabNumber]));
			TabSelect.find('select').prop('selectedIndex', SiteNumber); 
			TabSelect.find('select').trigger('change');
			$('.notifications').hide();
			TabSelect.find("select").focus();
		}
		else
		{
			$('.notifications').empty();
			$('.notifications').append('\'' + Input + '\'' + ' does not exist.')
			$('.notifications').show();
		}
	}

	function SearchTab(Input, Tab)
	{
		var Storage = GetStorage();
		var Sites = [];
		
		if(Storage[Tab] != undefined)
		{
			Array = Storage[Tab];
			for( i = 0; i < Array.length; i++ )
			{
				if( Array[i]['site'] != undefined )	
				{
					Sites.push(Array[i]['site'])
				}
			}
		}
		
		for(i=0; i < Sites.length; i++)
		{	
			if(Sites[i].indexOf(Input) != -1)
			{
				return i;
			}
		}

		return -1;
	}

	$("#quick-reports .expand").hide();
	$("#my-team-folders .expand").hide();


	LoadSite();

	TabSection.hide();

	$(window).unload(function() {
		UpdateStorage( CurrentTab, "LastTab" );
	});
	
	
    TabList.click(function(e) 
	{
    	e.preventDefault();
    	var TabNumber = $(this).index();
    	location.hash = TAB_LIST[TabNumber];
	});

	$(window).on('hashchange', function() 
	{
		var TabNumber = TAB_LIST.indexOf(location.hash.slice(1));
		var TabSelect = $('#' + (TAB_LIST[CurrentTab]));
		if( CurrentTab != TabNumber)
		{
			// hide last tab
			$(TabSection[CurrentTab]).hide();
			$(TabList[CurrentTab]).css({"background-color": "rgb(51,51,51)", "color": "white"});

			// show new tab
			CurrentTab = TabNumber;
			$(TabSection[TabNumber]).show();
			$(TabList[TabNumber]).css({"background-color": "lightgray", "color": "black"});
			
			TabSelect = $('#' + (TAB_LIST[CurrentTab]));
			if( TabNumber == QUICK_REPORTS || TabNumber == MY_TEAM_FOLDERS )
			{
				TabSelect.find(".settings").focus();
			}
			else
			{
				TabSelect.find(".expand").focus();
			}
		}
	});
	
	// expand button clicked
	$(".expand").click(function(e) 
	{
		e.preventDefault();
		var TabSelect = $('#' + (TAB_LIST[CurrentTab]));
		window.open(TabSelect.find("iframe")[0].src);
	});
	
	// expand menu site
	$(".action-list li").click(function(e)
	{
		e.preventDefault();
		window.open("http://netcraft.co.il");
	});
	
	$(".nav-section").click(function(e)
	{
		e.preventDefault();
		window.open("http://netcraft.co.il");
	});
	
	// settings button clicked
	$(".settings").click(function(e) 
	{
		e.preventDefault();
		var TabSelect = $('#' + (TAB_LIST[CurrentTab]));
		ListForm = TabSelect.find(".list-form");
		ListForm.slideToggle();
		ListForm.find("fieldset:first-of-type input:first-of-type").focus();
		if( !ListForm.is(":visible") )
		{
			ListForm.find("inside-tabs .settings").focus();
		}
	});

	// save button clicked
	$(".save").click(function(e) 
	{
		e.preventDefault();
		var TabSelect = $('#' + (TAB_LIST[CurrentTab]));
		SaveSites(TabSelect.find("form"));
	});

	// cancel button clicked
	$(".cancel").click(function() {
		var TabSelect = $('#' + (TAB_LIST[CurrentTab]));
		TabSelect.find(".list-form").slideUp();
		TabSelect.find(".settings").focus();
	});

	$('.search-box').submit(function(e) {
		e.preventDefault(); 
		var Input = $(this).find('input').val();
		InputSearch(Input);
	});
	
	// keyboard - escape (cancel)
	$(".tab form input").keydown(function(e) {
     	if (e.keyCode == 27) 
		{
			var TabSelect = $('#' + (TAB_LIST[CurrentTab]));
        	TabSelect.find(".cancel").trigger("click");
    	}
	});
	
	// keyboard - enter (save)
	$(".tab form input").keydown(function(e) {
     	if (e.keyCode == 13) 
		{
			var TabSelect = $('#' + (TAB_LIST[CurrentTab]));
        	TabSelect.find(".save").trigger("click");
    	}
	});
	
});
