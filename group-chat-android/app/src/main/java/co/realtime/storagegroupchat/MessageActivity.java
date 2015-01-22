package co.realtime.storagegroupchat;

import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TableLayout;

import org.json.JSONException;
import org.json.JSONObject;

import java.sql.Time;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;

import co.realtime.storage.ItemAttribute;
import co.realtime.storage.ItemSnapshot;
import co.realtime.storage.TableRef;
import co.realtime.storage.ext.OnError;
import co.realtime.storage.ext.OnItemSnapshot;
import config.Config;
import domains.Channel;
import domains.Message;
import handlers.StorageHandler;
import interfaces.InterfaceRefresher;
import preferences.PreferencesManager;
import ui.MessageTableRow;

public class MessageActivity extends ActionBarActivity implements InterfaceRefresher {

	private String channel;
	private boolean pause;
    private static boolean mIsInForegroundMode;
    private final int REQUEST_COMPOSE = 1;
    private boolean isFromCompose;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_message);

		Button composeBtn = (Button) findViewById(R.id.btCompose);
		composeBtn.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View v) {
				Intent messages = new Intent(MessageActivity.this,
						ComposeActivity.class).putExtra("channel", channel);
				startActivityForResult(messages, REQUEST_COMPOSE);
			}
		});
	}

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        switch (requestCode){
            case REQUEST_COMPOSE:
                isFromCompose = true;
                break;
            default:
                isFromCompose = false;
                break;
        }
    }

    @Override
	protected void onResume() {
		super.onResume();
        pause = false;
        mIsInForegroundMode = true;
        StorageHandler.selfHandler.messagesView = this;
        channel = getIntent().getStringExtra("channel");
        setTitle(channel);
        if (!isFromCompose) {
            TableLayout tableMessages = (TableLayout) findViewById(R.id.tableMessages);
            tableMessages.removeAllViews();
            getItems();
        }
        //loadMsg();

	}

	@Override
	protected void onPause() {
		super.onPause();
		pause = true;
        mIsInForegroundMode = false;
	}

    // Some function.
    public static boolean isInForeground() {
        return mIsInForegroundMode;
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_message, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.action_settings) {
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

	private void loadMsg() {
        ArrayList<Message> messages = StorageHandler.selfHandler.messages.get(channel).getMessages();
        for (Message msg : messages) {
            setmsg(msg);
        }
	}

	private void setmsg(Message msg) {	
		if(pause == false){
			Channel cn = StorageHandler.selfHandler.messages.get(channel);
			cn.setUnRead(0);
		}
		
		TableLayout tableMessages = (TableLayout) findViewById(R.id.tableMessages);

		if (msg.user.equals(PreferencesManager.getInstance(MessageActivity.this).loadUser())) {
			new MessageTableRow(this, tableMessages, true, msg);
		} else {
			new MessageTableRow(this, tableMessages, false, msg);
		}
	}

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    @Override
	public void refreshData(final Message msg) {
		runOnUiThread(new Runnable() {
            @Override
            public void run() {
                setmsg(msg);
            }
        });
	}

    private void getItems(){
        final ProgressDialog pd = new ProgressDialog(this);
        pd.setCancelable(false);
        pd.setProgressStyle(android.R.style.Widget_ProgressBar_Small);
        pd.show();
        TableRef tableRef = StorageHandler.selfHandler.storageRef.table(Config.TABLE_NAME);

        tableRef.equals(Config.PRIMARY_KEY,new ItemAttribute(channel)).getItems(new OnItemSnapshot() {
            @Override
            public void run(ItemSnapshot itemSnapshot) {
                if (itemSnapshot != null) {
                    String content = itemSnapshot.val().get(Config.ITEM_PROPERTY_MESSAGE).toString();
                    String user = itemSnapshot.val().get(Config.ITEM_PROPERTY_NICKNAME).toString();
                    String date = itemSnapshot.val().get(Config.ITEM_PROPERTY_DATE).toString();
                    final Message newMsg = new Message(user, content, date);
                    MessageActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            setmsg(newMsg);
                        }
                    });
                } else {
                    pd.dismiss();
                }
            }
        }, new OnError() {
            @Override
            public void run(Integer integer, String exception) {
                pd.dismiss();
                Log.e("Exception", "Exception " + exception);
            }
        });
    }
}
