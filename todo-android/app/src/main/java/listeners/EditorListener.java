package listeners;

import android.content.Context;
import android.view.KeyEvent;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.TextView;

import com.realtime.todo.MainActivity;

public class EditorListener implements TextView.OnEditorActionListener {

    private Context context;

    public EditorListener(Context context){
        this.context = context;
    }
    @Override
    public boolean onEditorAction(TextView v, int actionId, KeyEvent keyEvent) {
        if (actionId == EditorInfo.IME_ACTION_DONE) {
            InputMethodManager imm = (InputMethodManager)context.getSystemService(context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(v.getWindowToken(), 0);
            ((MainActivity)context).onKeyboardDone();
        }
        return false;
    }
}
