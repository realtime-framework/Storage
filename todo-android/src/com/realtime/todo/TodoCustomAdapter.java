package com.realtime.todo;

import java.util.ArrayList;
import java.util.LinkedHashMap;

import co.realtime.storage.ItemAttribute;
import android.app.Activity;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageButton;
import android.widget.TextView;

public class TodoCustomAdapter extends ArrayAdapter<LinkedHashMap<String, ItemAttribute>>{
	Context context;
	int layoutResId;
	ArrayList<LinkedHashMap<String, ItemAttribute>> data = new ArrayList<LinkedHashMap<String, ItemAttribute>>();
	TodoCustomAdapterReciver reciver;
	
	public TodoCustomAdapter(Context context, int layoutResourceId, ArrayList<LinkedHashMap<String, ItemAttribute>> data) {
		super(context, layoutResourceId, data);
		this.context = context;
		this.layoutResId = layoutResourceId;
		this.data = data;
	}
	

	@Override
	public View getView(final int position, View convertView, ViewGroup parent) {
		View row = convertView;
		ItemHolder holder = null;

		if(row == null){
			LayoutInflater inflater = ((Activity) context).getLayoutInflater();
			row = inflater.inflate(layoutResId, parent, false);
			holder = new ItemHolder();
			holder.tvTask = (TextView) row.findViewById(R.id.textView1);
			holder.ibState = (ImageButton) row.findViewById(R.id.button1);
			holder.ibRemove = (ImageButton) row.findViewById(R.id.button2);
			row.setTag(holder);
		} else {
			holder = (ItemHolder) row.getTag();
		}
		LinkedHashMap<String, ItemAttribute> item = data.get(position);
		holder.tvTask.setText(item.get("task").toString());
		if(item.get("state").compareTo(new ItemAttribute(1))==0){
			holder.ibState.setBackgroundResource(R.drawable.check_on1);
		} else {
			holder.ibState.setBackgroundResource(R.drawable.check_off1);
		}

		holder.ibRemove.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				if(reciver!=null)
					reciver.btRemovePressed(position);
			}
		});

		holder.ibState.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				if(reciver!=null)
					reciver.btStatePressed(position);
			}
		});

		return row;
	}
	
	public void setActionsReciver(TodoCustomAdapterReciver reciver){
		this.reciver = reciver;
	}
	
	public interface TodoCustomAdapterReciver{
		public void btRemovePressed(int position);
		public void btStatePressed(int position);
	}
	
	static class ItemHolder {
		TextView tvTask;
		ImageButton ibState;
		ImageButton ibRemove;
	}

}
