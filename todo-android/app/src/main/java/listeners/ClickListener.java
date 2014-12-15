package listeners;

import android.content.Context;
import android.view.View;

import com.realtime.todo.MainActivity;
import com.realtime.todo.R;

import java.util.LinkedHashMap;

import co.realtime.storage.ItemAttribute;
import handlers.StorageHandler;

public class ClickListener implements View.OnClickListener {

    private Context context;

    public ClickListener(Context context){
        this.context = context;
    }

    @Override
    public void onClick(View v) {
       switch (v.getId()){
           case R.id.buttonCompleteAll:
               for (LinkedHashMap<String, ItemAttribute> item : ((MainActivity)context).getItems()) {
                   ItemAttribute state = item.get("state");
                   if (state.compareTo(new ItemAttribute(1)) != 0 && ((MainActivity)context).isSelectAllAction()) {
                       item.put("state", new ItemAttribute(1));
                       StorageHandler.getInstance(context).storageSet(item);
                   }
                   if (state.compareTo(new ItemAttribute(1)) == 0 && ((MainActivity)context).isSelectAllAction()) {
                       item.put("state", new ItemAttribute(0));
                       StorageHandler.getInstance(context).storageSet(item);
                   }
               }

               ((MainActivity)context).setSelectAllAction(!((MainActivity)context).isSelectAllAction());
               ((MainActivity)context).updateListView();
               break;
           default:
               break;
       }
    }
}
