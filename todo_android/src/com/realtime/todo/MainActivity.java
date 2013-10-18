package com.realtime.todo;

import co.realtime.storage.ItemAttribute;
import co.realtime.storage.ItemSnapshot;
import co.realtime.storage.StorageRef;
import co.realtime.storage.StorageRef.StorageEvent;
import co.realtime.storage.TableRef;
import co.realtime.storage.ext.OnError;
import co.realtime.storage.ext.OnItemSnapshot;
import co.realtime.storage.ext.OnReconnected;
import co.realtime.storage.ext.StorageException;
import android.os.Bundle;
import android.app.Activity;
import android.content.Context;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.RadioGroup;
import android.widget.RadioGroup.OnCheckedChangeListener;
import android.widget.SimpleAdapter;
import android.widget.TextView;


import java.util.ArrayList;
import java.util.Calendar;
import java.util.LinkedHashMap;
import java.util.Random;

import com.realtime.todo.TodoCustomAdapter.TodoCustomAdapterReciver;


public class MainActivity extends Activity implements TodoCustomAdapterReciver {
	ImageButton buttonCompleteAll;
	EditText editTextTableName;
	EditText editTextTask;
	ListView listViewTasks;
	RadioGroup radioGroup;
	
	SimpleAdapter sAdapter;
	TodoCustomAdapter tcAdapter;
	
	StorageRef storage;
	String listName;
	OnError onError;
	OnItemSnapshot onPutUpdate;
	OnItemSnapshot onDelete;
	int taskScope; //0 - all, 1 - active, 2 - completed
	ArrayList<LinkedHashMap<String, ItemAttribute>> items = new ArrayList<LinkedHashMap<String, ItemAttribute>>();
	final ArrayList<LinkedHashMap<String, ItemAttribute>> itemsToShow = new ArrayList<LinkedHashMap<String, ItemAttribute>>(); 
	
	Context uiContext;
	boolean selectAllAction;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		uiContext = this;
		setContentView(R.layout.activity_main);
		this.selectAllAction = true;
		taskScope = 0;
		
		listName = generateRandomString();
				
		try {
			//for security reasons change the @"2Ze1dz" for your application key
			storage = new StorageRef("2Ze1dz", null, "PM.Anonymous", true, false, "https://storage-balancer.realtime.co/server/ssl/1.0");
		} catch (StorageException e) {
			e.printStackTrace();
		}			
		
		storage.onReconnected(new OnReconnected(){
			@Override
			public void run(StorageRef sender) {
				runOnUiThread(new Runnable(){
					@Override
					public void run() {
						items.clear();
						getItems();
					}});
			}
		});
		
		onError = new OnError(){
			@Override
			public void run(Integer code, String errorMessage) {
				System.out.println(String.format("st:: error: %d (%s)", code, errorMessage));
			}};
			
		onPutUpdate = new OnItemSnapshot(){
			@Override
			public void run(final ItemSnapshot itemSnapshot) {
				int idx = getIndexOfItemSnapshot(itemSnapshot);
				if(idx>=0){
					items.set(idx, itemSnapshot.val());
				} else {
					items.add(itemSnapshot.val());
				}
				updateListView();
			}
		};
		
		onDelete = new OnItemSnapshot(){
			@Override
			public void run(final ItemSnapshot itemSnapshot) {
				int idx = getIndexOfItemSnapshot(itemSnapshot);
				if(idx>=0){
					items.remove(idx);
					updateListView();
				}			
			}
		};
		
				
		buttonCompleteAll = (ImageButton) findViewById(R.id.buttonCompleteAll);
		editTextTableName = (EditText) findViewById(R.id.editTextTableName);
		editTextTask = (EditText) findViewById(R.id.editTextTask);
		listViewTasks = (ListView) findViewById(R.id.listViewTasks);
		radioGroup = (RadioGroup) findViewById(R.id.radio_group);
		
		editTextTableName.setText(listName);
		
		buttonCompleteAll.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View v) {
				for(LinkedHashMap<String, ItemAttribute> item : items){
					ItemAttribute state = item.get("state");
					if(state.compareTo(new ItemAttribute(1)) != 0 && selectAllAction){						
						item.put("state", new ItemAttribute(1));						
						storage.table("todoTable").item(item.get("listName"), item.get("timestamp")).set(item, null, onError);
					}
					if(state.compareTo(new ItemAttribute(1)) == 0 && !selectAllAction){
						item.put("state", new ItemAttribute(0));
						storage.table("todoTable").item(item.get("listName"), item.get("timestamp")).set(item, null, onError);
					}
				}
				selectAllAction = !selectAllAction;
				updateListView();
			}
		});
		
		radioGroup.setOnCheckedChangeListener(new OnCheckedChangeListener(){
			@Override
			public void onCheckedChanged(RadioGroup rGroup, int checkedId) {
				switch(checkedId){
				case R.id.radio_all:					
					taskScope = 0;					
					break;
				case R.id.radio_active:
					taskScope = 1;
					break;
				case R.id.radio_completed:
					taskScope = 2;
					break;
				}
				updateListView();
			}
		});
		
		editTextTableName.setOnEditorActionListener(new TextView.OnEditorActionListener() {
			@Override
			public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
				if (actionId == EditorInfo.IME_ACTION_DONE) { 
					InputMethodManager imm = (InputMethodManager)getSystemService(INPUT_METHOD_SERVICE);
					imm.hideSoftInputFromWindow(v.getWindowToken(), 0);
					onKeyboardDone();
				}
				return false;
			}
		});
		editTextTask.setOnEditorActionListener(new TextView.OnEditorActionListener() {
			@Override
			public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
				if (actionId == EditorInfo.IME_ACTION_DONE) { 
					InputMethodManager imm = (InputMethodManager)getSystemService(INPUT_METHOD_SERVICE);
					imm.hideSoftInputFromWindow(v.getWindowToken(), 0);
					onKeyboardDone();
				}
				return false;
			}
		});
		
		tcAdapter = new TodoCustomAdapter(this, R.layout.task_item, itemsToShow);
		tcAdapter.setActionsReciver(this);
		listViewTasks.setAdapter(tcAdapter);
		
		getItems();
		storage.table("todoTable").on(StorageEvent.PUT, new ItemAttribute(listName), onPutUpdate);
		storage.table("todoTable").on(StorageEvent.UPDATE, new ItemAttribute(listName), onPutUpdate);
		storage.table("todoTable").on(StorageEvent.DELETE, new ItemAttribute(listName), onDelete);
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.main, menu);
		return true;
	}

	void onKeyboardDone(){
		String newListName = editTextTableName.getText().toString();
		String newTask = editTextTask.getText().toString();
		
		if(newTask.length() > 0){
			LinkedHashMap<String, ItemAttribute> itemToPut = new LinkedHashMap<String, ItemAttribute>();
			itemToPut.put("listName", new ItemAttribute(listName));
			Calendar cal = Calendar.getInstance();
			long secondsSinceEpoch = cal.getTimeInMillis() / 1000L;
			itemToPut.put("timestamp", new ItemAttribute(secondsSinceEpoch));
			itemToPut.put("task", new ItemAttribute(newTask));
			itemToPut.put("state", new ItemAttribute(0));
			storage.table("todoTable").push(itemToPut, null, onError);
			items.add(itemToPut);			
			updateListView();
			editTextTask.setText("");
		}
		
		if(!newListName.equals(listName)){ //new list name
			storage.table("todoTable").off(StorageEvent.PUT, new ItemAttribute(listName), onPutUpdate);
			storage.table("todoTable").off(StorageEvent.UPDATE, new ItemAttribute(listName), onPutUpdate);
			storage.table("todoTable").off(StorageEvent.DELETE, new ItemAttribute(listName), onDelete);
			items.clear();
			listName = newListName;
			getItems();
			storage.table("todoTable").on(StorageEvent.PUT, new ItemAttribute(listName), onPutUpdate);
			storage.table("todoTable").on(StorageEvent.UPDATE, new ItemAttribute(listName), onPutUpdate);
			storage.table("todoTable").on(StorageEvent.DELETE, new ItemAttribute(listName), onDelete);
		}		
	}
	
	void getItems(){
		TableRef tr = storage.table("todoTable").equals("listName", new ItemAttribute(listName));
		tr.getItems(new OnItemSnapshot(){
			@Override
			public void run(ItemSnapshot item) {
				if(item!=null){
					int idx = getIndexOfItemSnapshot(item);
					if(idx>=0){
						items.set(idx, item.val());
					} else {
						items.add(item.val());
					}
				} else {
					updateListView();
				}
			}}, onError);
	}


	@Override
	public void btRemovePressed(int position) {
		LinkedHashMap<String, ItemAttribute> item = items.get(position);
		storage.table("todoTable").item(item.get("listName"), item.get("timestamp")).del(null, onError);		
		items.remove(position);
		updateListView();
	}

	@Override
	public void btStatePressed(int position) {
		LinkedHashMap<String, ItemAttribute> item = items.get(position);
		ItemAttribute ia = item.get("state");
		if(ia.compareTo(new ItemAttribute(1))==0){
			item.put("state", new ItemAttribute(0));
		} else {
			item.put("state", new ItemAttribute(1));		
		}		
		storage.table("todoTable").item(item.get("listName"), item.get("timestamp")).set(item, null, onError);
		updateListView();
	}
	
	private int getIndexOfItemSnapshot(ItemSnapshot item){
		ItemAttribute iTimestamp = item.val().get("timestamp");
		for(int i = 0; i < items.size(); i++){
			LinkedHashMap<String, ItemAttribute> is = items.get(i);
			if(is!=null){
				ItemAttribute ist = is.get("timestamp");
				if(ist!=null){
					if(ist.compareTo(iTimestamp)==0){
						return i;
					}
				} 
			}
		}
		return -1;
	}
	
	private void updateListView(){
		runOnUiThread(new Runnable(){
			@Override
			public void run() {
				itemsToShow.clear();
				for(LinkedHashMap<String, ItemAttribute> item : items){
					if(checkIfItemInScope(item)){
						itemsToShow.add(item);
					}
				}
				tcAdapter.notifyDataSetChanged();
			}});
	}
	
	boolean checkIfItemInScope(LinkedHashMap<String, ItemAttribute> item){
		if(taskScope==0)
			return true;
		if(taskScope==1 && item.get("state").compareTo(new ItemAttribute(0))==0)
			return true;
		if(taskScope==2 && item.get("state").compareTo(new ItemAttribute(1))==0)
			return true;
		return false;
			
	}
	
	static final String strSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	static Random rnd = new Random();
	String generateRandomString(){
		StringBuilder sb = new StringBuilder( 6 );
		for( int i = 0; i < 6; i++ ) 
			sb.append( strSet.charAt( rnd.nextInt(strSet.length()) ) );
		return sb.toString();
	}
}
