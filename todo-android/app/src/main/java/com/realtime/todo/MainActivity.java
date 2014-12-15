package com.realtime.todo;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.LinkedHashMap;
import java.util.Locale;

import android.app.Activity;
import android.app.ActionBar;
import android.app.Fragment;
import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.support.v13.app.FragmentPagerAdapter;
import android.os.Bundle;
import android.support.v4.view.ViewPager;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;

import adapters.TodoCustomAdapter;
import co.realtime.storage.ItemAttribute;
import co.realtime.storage.ItemSnapshot;
import config.Config;
import handlers.StorageHandler;
import helpers.ListNameHelper;
import listeners.ClickListener;
import listeners.EditorListener;


public class MainActivity extends Activity implements TodoCustomAdapter.TodoCustomAdapterReceiver {

    /**
     * The {@link android.support.v4.view.PagerAdapter} that will provide
     * fragments for each of the sections. We use a
     * {@link FragmentPagerAdapter} derivative, which will keep every
     * loaded fragment in memory. If this becomes too memory intensive, it
     * may be best to switch to a
     * {@link android.support.v13.app.FragmentStatePagerAdapter}.
     */
    SectionsPagerAdapter mSectionsPagerAdapter;

    /**
     * The {@link ViewPager} that will host the section contents.
     */
    ViewPager mViewPager;

    private static TodoCustomAdapter tcAdapter;

    private int taskScope; //0 - all, 1 - active, 2 - completed
    private ArrayList<LinkedHashMap<String, ItemAttribute>> items = new ArrayList<LinkedHashMap<String, ItemAttribute>>();
    private final ArrayList<LinkedHashMap<String, ItemAttribute>> itemsToShow = new ArrayList<LinkedHashMap<String, ItemAttribute>>();

    private boolean selectAllAction;

    public boolean isSelectAllAction() {
        return selectAllAction;
    }

    public void setSelectAllAction(boolean selectAllAction) {
        this.selectAllAction = selectAllAction;
    }

    public ArrayList<LinkedHashMap<String, ItemAttribute>> getItems() {
        return items;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().requestFeature(Window.FEATURE_ACTION_BAR);
        setContentView(R.layout.activity_main);

        selectAllAction = true;
        taskScope = 0;
        tcAdapter = new TodoCustomAdapter(this, R.layout.task_item, itemsToShow);
        tcAdapter.setActionsReceiver(this);

        // Set up the action bar.
        final ActionBar actionBar = getActionBar();
        actionBar.setNavigationMode(ActionBar.NAVIGATION_MODE_TABS);

        StorageHandler.getInstance(this).setListName(ListNameHelper.generateRandomList());

        // Create the adapter that will return a fragment for each of the three
        // primary sections of the activity.
        mSectionsPagerAdapter = new SectionsPagerAdapter(getFragmentManager());

        // Set up the ViewPager with the sections adapter.
        mViewPager = (ViewPager) findViewById(R.id.pager);
        mViewPager.setAdapter(mSectionsPagerAdapter);

        // When swiping between different sections, select the corresponding
        // tab. We can also use ActionBar.Tab#select() to do this if we have
        // a reference to the Tab.
        mViewPager.setOnPageChangeListener(new ViewPager.SimpleOnPageChangeListener() {
            @Override
            public void onPageSelected(int position) {
                actionBar.setSelectedNavigationItem(position);
            }
        });

        // For each of the sections in the app, add a tab to the action bar.
        for (int i = 0; i < mSectionsPagerAdapter.getCount(); i++) {
            // Create a tab with text corresponding to the page title defined by
            // the adapter. Also specify this Activity object, which implements
            // the TabListener interface, as the callback (listener) for when
            // this tab is selected.
            actionBar.addTab(
                    actionBar.newTab()
                            .setText(mSectionsPagerAdapter.getPageTitle(i))
                            .setTabListener(new ActionBar.TabListener() {
                                @Override
                                public void onTabSelected(ActionBar.Tab tab, FragmentTransaction ft) {
                                    switch(tab.getPosition()){
                                        case 0:
                                            taskScope = 0;
                                            break;
                                        case 1:
                                            taskScope = 1;
                                            break;
                                        case 2:
                                            taskScope = 2;
                                            break;
                                    }
                                    updateListView();
                                }

                                @Override
                                public void onTabUnselected(ActionBar.Tab tab, FragmentTransaction ft) {

                                }

                                @Override
                                public void onTabReselected(ActionBar.Tab tab, FragmentTransaction ft) {

                                }
                            }));
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public void btRemovePressed(int position) {
        LinkedHashMap<String, ItemAttribute> item = items.get(position);
        StorageHandler.getInstance(this).storageDel(item);
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
        StorageHandler.getInstance(this).storageSet(item);
        updateListView();
    }

    /**
     * A {@link FragmentPagerAdapter} that returns a fragment corresponding to
     * one of the sections/tabs/pages.
     */
    public class SectionsPagerAdapter extends FragmentPagerAdapter {

        public SectionsPagerAdapter(FragmentManager fm) {
            super(fm);
        }

        @Override
        public Fragment getItem(int position) {
            // getItem is called to instantiate the fragment for the given page.
            // Return a PlaceholderFragment (defined as a static inner class below).
            return PlaceholderFragment.newInstance(position + 1);
        }

        @Override
        public int getCount() {
            // Show 3 total pages.
            return 3;
        }

        @Override
        public CharSequence getPageTitle(int position) {
            Locale l = Locale.getDefault();
            switch (position) {
                case 0:
                    return getString(R.string.title_section1).toUpperCase(l);
                case 1:
                    return getString(R.string.title_section2).toUpperCase(l);
                case 2:
                    return getString(R.string.title_section3).toUpperCase(l);
            }
            return null;
        }
    }

    /**
     * A placeholder fragment containing a simple view.
     */
    public static class PlaceholderFragment extends Fragment {
        /**
         * The fragment argument representing the section number for this
         * fragment.
         */
        private static final String ARG_SECTION_NUMBER = "section_number";

        /**
         * Returns a new instance of this fragment for the given section
         * number.
         */
        public static PlaceholderFragment newInstance(int sectionNumber) {
            PlaceholderFragment fragment = new PlaceholderFragment();
            Bundle args = new Bundle();
            args.putInt(ARG_SECTION_NUMBER, sectionNumber);
            fragment.setArguments(args);
            return fragment;
        }

        public PlaceholderFragment() {
        }

        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container,
                                 Bundle savedInstanceState) {
            View rootView = inflater.inflate(R.layout.fragment_main, container, false);
            EditText tableName = (EditText) rootView.findViewById(R.id.editTextTableName);
            tableName.setText(StorageHandler.getInstance(getActivity()).getListName());

            EditText editTextTask = (EditText) rootView.findViewById(R.id.editTextTask);


            EditorListener editorActionListener = new EditorListener(getActivity());
            tableName.setOnEditorActionListener(editorActionListener);
            editTextTask.setOnEditorActionListener(editorActionListener);

            ImageButton buttonCompleteAll = (ImageButton) rootView.findViewById(R.id.buttonCompleteAll);
            buttonCompleteAll.setOnClickListener(new ClickListener(getActivity()));

            ListView listViewTasks = (ListView) rootView.findViewById(R.id.listViewTasks);
            listViewTasks.setAdapter(tcAdapter);

            StorageHandler.getInstance(getActivity()).getItems();
            StorageHandler.getInstance(getActivity()).storageOn();
            return rootView;
        }
    }

    public void onKeyboardDone(){
        String newListName = ((EditText)findViewById(R.id.editTextTableName)).getText().toString();
        String newTask = ((EditText)findViewById(R.id.editTextTask)).getText().toString();

        if(newTask.length() > 0){
            LinkedHashMap<String, ItemAttribute> itemToPut = new LinkedHashMap<String, ItemAttribute>();
            itemToPut.put(Config.PRIMARY_KEY, new ItemAttribute(StorageHandler.getInstance(this).getListName()));
            Calendar cal = Calendar.getInstance();
            long secondsSinceEpoch = cal.getTimeInMillis() / 1000L;
            itemToPut.put(Config.SECONDARY_KEY, new ItemAttribute(secondsSinceEpoch));
            itemToPut.put("task", new ItemAttribute(newTask));
            itemToPut.put("state", new ItemAttribute(0));
            StorageHandler.getInstance(this).storagePush(itemToPut);
            items.add(itemToPut);
            updateListView();
            ((EditText)findViewById(R.id.editTextTask)).setText("");
        }

        if(!newListName.equals(StorageHandler.getInstance(this).getListName())){
            //new list name
            StorageHandler.getInstance(this).storageOff();
            items.clear();
            StorageHandler.getInstance(this).setListName(newListName);
            StorageHandler.getInstance(this).getItems();
            StorageHandler.getInstance(this).storageOn();
        }
    }

    public void updateListView(){
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

    private boolean checkIfItemInScope(LinkedHashMap<String, ItemAttribute> item){
        if(taskScope==0)
            return true;
        if(taskScope==1 && item.get("state").compareTo(new ItemAttribute(0))==0)
            return true;
        if(taskScope==2 && item.get("state").compareTo(new ItemAttribute(1))==0)
            return true;
        return false;

    }

    public void clearItems(){
        items.clear();
    }

    public void getItems(ItemSnapshot item){
        if(item!=null) {
            int idx = getIndexOfItemSnapshot(item);
            if (idx >= 0) {
                items.set(idx, item.val());
            } else {
                items.add(item.val());
            }
            updateListView();
        }
    }

    public void updateItems(ItemSnapshot itemSnapshot){
        int idx = getIndexOfItemSnapshot(itemSnapshot);
        if (idx >= 0) {
            items.set(idx, itemSnapshot.val());
        } else {
            items.add(itemSnapshot.val());
        }
        updateListView();
    }

    public void deleteItems(ItemSnapshot itemSnapshot){
        int idx = getIndexOfItemSnapshot(itemSnapshot);
        if(idx>=0){
            items.remove(idx);
            updateListView();
        }
    }

    private int getIndexOfItemSnapshot(ItemSnapshot item){
        if(item != null) {
            ItemAttribute iTimestamp = item.val().get(Config.SECONDARY_KEY);
            for (int i = 0; i < items.size(); i++) {
                LinkedHashMap<String, ItemAttribute> is = items.get(i);
                if (is != null) {
                    ItemAttribute ist = is.get(Config.SECONDARY_KEY);
                    if (ist != null) {
                        if (ist.compareTo(iTimestamp) == 0) {
                            return i;
                        }
                    }
                }
            }
        }
        return -1;
    }


}
