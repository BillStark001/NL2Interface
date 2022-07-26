<template>
  <div>
    <div style="margin:10px;">
      <!-- class="container-lg container-demo" -->
      <simple-modal v-model="showSwitchDBModal" title='Switch Database'>
        <template slot="body">
          <div class="art-font" style="font-size:18px; margin-bottom:12px"><i class="fa fa-database" aria-hidden="true"></i> Select a database from this list</div>
          <vue-single-select
            v-model="database_name"
            placeholder="Select a database"
            :options="database_list"
            max-height="120px"
          ></vue-single-select>
          <div class="modal-action">
            <button
              type="button"
              class="btn btn-light pull-right btn-default btn-large"
              @click="refreshdatabase(database_name)"
              id="switchBtn"
            ><i class="fa fa-arrow-circle-right btn-large" aria-hidden="true"></i> <span class="art-font">Switch</span></button>
          </div>
          <div style="height:30px;"></div>
          <div class="art-font" style="font-size:18px; margin-bottom:12px"><i class="fa fa-cloud-upload" aria-hidden="true"></i> Or upload from a CSV file</div>
          <input type="file" class="form-control-file btn-light" name="filename" id="csv_file_input"  />
          <small style="color:red;" v-if="error_in_parsing">{{error_msg_in_parsing}}</small>
          <div class="modal-action">
            <button type="button" class="btn btn-light pull-right btn-default btn-large" @click="onclick_upload"><i class="fa fa-upload" aria-hidden="true"></i> <span class="art-font">Upload</span></button>
            <span><div class="spinner-border text-success" role="status">
              <span class="sr-only">Loading...</span>
            </div></span>
          </div>
        </template>
      </simple-modal>
      <!-- schema setting modal -->
      <simple-modal v-model="show_schema_setting_modal" title='Table Schema Setting'>
        <template slot="body">
          <!-- table schema settings. -->
          <div class="modal-body" ID="schema_modal_body">
        <div style="margin-bottom:12px;">You can rename columns and set data type for each column.</div>
        <div style="margin-bottom:8px;">
          <div v-for="(old_col_name,index) in focused_table_column_names" :key="index">
            <p><small class="text-muted">{{old_col_name}}</small></p>
            <input type="text" class="form-control col-rename-input" :index="index" style="height:34px;width:85%" aria-label="..." :value="updated_column_names_map[focus_db][focus_table_name][index]" :placeholder="old_col_name">  

            <div class="dropup art-font">
              <button class="dropbtn btn dropup-toggle column-type-btn">string<span class="caret text-muted"></span></button>
              <div class="list-group dropup-content">
                <a href="#" class="list-group-item filter-col-btn column-type" value="string" :order="index">string</a>
                <a href="#" class="list-group-item filter-col-btn column-type" value="integer" :order="index">integer</a>
                <a href="#" class="list-group-item filter-col-btn column-type" value="float" :order="index">float</a>
              </div>
            </div>
            <small style="color:red" :id="'column_error_' + index" class="column_error"></small>
          </div>
        </div>
        </div>


        <div class="modal-action">
            <button class="btn btn-light pull-right btn-default btn-large" style="margin-right:6px;" @click="on_click_update_schema_btn()"><i class="fa fa-check-circle" aria-hidden="true"></i> Update Schema</button>
            <button class="btn btn-light pull-right btn-default btn-large" style="margin-right:6px;" @click="on_open_add_column_modal()"><i class="fa fa-plus" aria-hidden="true"></i> New Column</button>
            <button class="btn btn-light pull-right btn-large" style="margin-right:6px;" id="cancelUpdateSchemaBtn"><i class="fa fa-times" aria-hidden="true"></i> Cancel</button>
          </div>

        

        </template>
      </simple-modal>
      <!-- append new column -->

      <simple-modal v-model="show_add_column_modal" title='Add New Column'>
        <template slot="body">
          <div class="modal-body">
        <div style="margin-bottom:20px; margin-top: 25px;">You can add new column to the table</div>
        <div style="margin-bottom:8px;">
          <div>
            <input type="text" class="form-control col-add-input" style="height:34px;width:85%" aria-label="..." placeholder="new column name" id="col-add-input">  

            <div class="dropup art-font">
              <button class="dropbtn btn dropup-toggle" id="new_column_type_btn" value="string">string<span class="caret text-muted"></span></button>
              <div class="list-group dropup-content">
                <a href="#" class="list-group-item filter-col-btn column-type" value="string">string</a>
                <a href="#" class="list-group-item filter-col-btn column-type" value="integer">integer</a>
                <a href="#" class="list-group-item filter-col-btn column-type" value="float">float</a>
              </div>
            </div>
            <p><small style="color:red;">{{error_msg_in_adding_column}}</small></p>
          </div>
        </div>

        <div style="margin-bottom:10px; margin-top: 20px;">Default value</div>
        <input type="text" class="form-control col-add-input" style="height:34px;width:85%" aria-label="..." placeholder="default value of this column" id="col-default-input">  


          </div>


        <div class="modal-action">
            <button class="btn btn-light pull-right btn-default btn-large" style="margin-right:6px;" :disabled="error_msg_in_adding_column.length != 0"  @click="on_click_add_column_btn()"><i class="fa fa-check-circle" aria-hidden="true"></i> Add</button>
            <button class="btn btn-light pull-right btn-large" style="margin-right:6px;" id="cancelAddColumnBtn"><i class="fa fa-times" aria-hidden="true"></i> Cancel</button>
          </div>

        

        </template>
      </simple-modal>

      <div v-if="system_error_message.trim().length != 0">
        <div style="padding: 5px;">
          <div id="inner-message" class="alert alert-danger">
            {{system_error_message}}
            <!-- <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button> -->
          </div>
        </div>
      </div>

      <div class="row fill" >
        <div class="col-sm-3 col-md-2 col-lg-2 col-xl-2 fill sidebar" style="margin-top:15px;margin-top: 15px;">
          <div class="sidebar-header text-muted">Databases</div>
          <div class="database-nodes">
            <div v-if="!loading">
              <div class="database-node">
                <i class="fa fa-database"></i>
                <span style="font-weight: normal;">{{focus_db}}</span>
              </div>
              <div
                @click="refreshtable(table)"
                class="database-table"
                v-for="(table,index) in databases[focus_db]"
                :key="index"
                :class="{ 'tableactive': table.toUpperCase() == focus_table['name'].toUpperCase() }"
              >
                <i class="fa fa-table"></i>
                <span style="font-size:14px;">{{table}}</span>
              </div>
            </div>
          </div>
          <div class="action">
            <button type="button" class="btn btn-light btn-large btn-default" style="height:40px;"  @click="on_open_switch_database_modal()"><i class="fa fa-arrow-circle-o-right" aria-hidden="true"></i> <span class="art-font">Switch database</span></button>
          </div>
        </div>
        <div class="col-sm-9 col-md-10 col-lg-10 col-xl-10" style="border-left: thin solid rgb(204, 204, 204);">
          <div>
            <div class="form-group query">
              <div class="art-font" style="font-size:20px;margin-bottom:18px;margin-top:15px;">Enter query</div>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  v-model="question"
                  placeholder="Example: What is the average and maximum age of all singers?"
                />
                <span class="input-group-btn">
                  <button
                    class="btn btn-group btn-default"
                    type="button"
                    disabled
                    v-if="queryloading"
                  >
                    <div class="loader loader-button"></div>
                  </button>
                  <button @click="query" class="btn btn-dark btn-group btn-default" type="button" v-else><i class="fa fa-paper-plane" aria-hidden="true"></i><span class="art-font"> GO !</span></button>
                </span>
              </div>
              <div class="sql" style="min-height:60px;">
              <pre v-if="sql" class="sql-container" v-highlightjs="sql"><code class="sql"></code></pre>
              </div>
              <div id="data-table" style="font-size:14px;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="sep_div"></div>
        
    <div class="footer">
    
    <!-- <div id="data-table"></div> -->

      <nav class="navbar navbar-default shadow" style="background:#cccccc;width: 100%;border-radius:0px;">
        
  <div class="container-fluid">
    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      
      <div class="navbar-form navbar-right">
        <div class="form-group">
          <div style="position:absolute;left:10px;bottom:10px" class="text-muted"><i class="fa fa-filter" aria-hidden="true"></i> <span class="art-font" style="font-size:14px;">Table Filter</span></div>
        <!-- column selector  -->
        <div class="dropup art-font">
          <button class="dropbtn btn dropdown-toggle" id="filter-field">{{filter_column_name.length == 0 ? "Field" : filter_column_name}} <span class="caret text-muted"></span></button>
          <div class="list-group dropup-content">
            <!-- <a href="#" class="list-group-item filter-col-btn" value="name">name</a>
            <a href="#" class="list-group-item filter-col-btn" value="age">age</a>
            <a href="#" class="list-group-item filter-col-btn" value="col">fav color</a> -->
            <!-- focused_table_column_names -->
            <a href="#" class="list-group-item filter-col-btn" v-for="(col,index) in table_column_names_for_filters" :key="index" :value="col" @click="on_chosen_filter_column($event)">{{col}}</a>
          </div>
        </div>
        <!-- operator selector -->
        <div class="dropup art-font">
          <button class="dropbtn btn dropdown-toggle" id="filter-type">{{filterOps.trim().length == 0 ? "Type" : filterOps}} <span class="caret text-muted"></span></button>
          <div class="list-group dropup-content" style="min-width: 4em;">
            <a href="#" class="list-group-item filter-op-btn" value="=">=</a>
            <a href="#" class="list-group-item filter-op-btn" value="<">&lt;</a>
            <a href="#" class="list-group-item filter-op-btn" value="<=">&lt;=</a>
            <a href="#" class="list-group-item filter-op-btn" value=">">&gt;</a>
            <a href="#" class="list-group-item filter-op-btn" value=">=">&gt;=</a>
            <a href="#" class="list-group-item filter-op-btn" value="!=">!=</a>
            <a href="#" class="list-group-item filter-op-btn" value="like">like</a>
          </div>
        </div>

        <input type="text" id="filter-value" class="form-control" placeholder="value to filter" style="height:34px;" aria-describedby="sizing-addon2" />

        <button class="btn btn-default" @click="on_clear_filter_btn_clicked()"><i class="fa fa-filter" aria-hidden="true"></i> Clear Filter</button>
        <button class="btn btn-default" @click="on_click_schema_setting_btn()"><i class="fa fa-cog" aria-hidden="true"></i> Schema Settings</button>
        </div>


      </div>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>

      

  </div>
  </div>
</template>

<script>
import SimpleModal from "simple-modal-vue";
import VueSingleSelect from "vue-single-select";
import BounceLoader from 'vue-spinner/src/BounceLoader.vue';
// csv parsing
import parse from "csv-parse";
// table display / editable
import moment from 'moment';
import Tabulator from 'tabulator-tables';


export default {
  name: "Footer",
  data() {
    return {
      column_regex: /^([a-zA-Z0-9_]+)$/, //use /^([a-zA-Z0-9]+)$/ if space/underscore is not accepted. Or use /^([a-zA-Z0-9_ ]+)$/
      databases: [],
      database_list: [],
      database_name: "",
      focus_db: "",
      tables: {},
      focus_table: {},
      focus_table_name: "",
      loading: false,
      showSwitchDBModal: false,
      show_schema_setting_modal:false,
      show_add_column_modal:false,
      queryloading: false,
      sql: "",
      sql_highlighted: "",
      question:"",
      file_reader:{},
      csv_database_name:"CSV",
      csv_tables:{},
      csv_file_name:"",
      max_csv_row_number: 200,
      error_in_parsing:false,
      error_msg_in_parsing:"",
      table:[],
      filterOps:"Type",
      filter_column_name:"",
      focused_table_column_names:[],
      updated_column_names_map:{}, 
      table_column_names_for_filters:[],
      updated_column_types_map:{},
      system_error_message:"" ,
      error_msg_in_adding_column:"",
      column_error_msgs: []
    };
  },
  components: { SimpleModal, VueSingleSelect ,BounceLoader},
  mounted: async function() {
    this.loading = true;
    const response = await fetch("api/database/list");
    const json = await response.json();
    this.databases = json["databases"]; 
    this.databases[this.csv_database_name] = []; 
    this.focus_db = Object.keys(this.databases)[0]; 

    this.database_list = []; 
    for (let name in this.databases) {
      this.database_list.push(name);
    }

    await this.loaddatabase(this.focus_db);

    // init the file_reader
    this.file_reader  = new FileReader();
    this.file_reader.onload = (loadedEvent)=>{
          let content = loadedEvent.target.result;
          this.parse_csv_string(content);
    };
    this.loading = false;

    // set up the op filter triggers
    $('.filter-op-btn').on('click',(e)=>{
      let target = e.target;
      let op = $(target).attr('value');
      this.filterOps = op;
      this.update_filter();
    });

    $('#filter-value').on('keyup',(e)=>{
      e.preventDefault();
      this.update_filter();
    });

  },
  methods: {
    refreshtable: function(name) {
      this.loading = true;
      
      if(this.focus_db != this.csv_database_name){
        this.loadtable(name); // load sqlite tables
      }
      else{
        this.load_csv_table(name);
      }
      this.on_clear_filter_btn_clicked();
      this.loading = false;
    },
    refreshdatabase: async function(name) {
      this.showSwitchDBModal = false;
      this.loading = true;
      this.focus_db = name;
      await this.loaddatabase(name);
      this.loading = false;
    },
    after_loading_table: function(colNames,cols,name,is_csv){
      let new_col_names = [];
      this.focused_table_column_names = colNames;
      this.focus_table["columns"] = cols;
      this.focus_table["name"] = name;
      this.focus_table_name = name;
      let focus_db = this.focus_db;
      if(is_csv){
        this.focus_table["data"] = this.csv_tables[name];
      }
      else{
        this.focus_table["data"] = this.tables[name];
      }
      if (!Object.keys(this.updated_column_names_map).includes(focus_db)){
        this.updated_column_names_map[focus_db] = {};
      }
      if(!Object.keys(this.updated_column_names_map[focus_db]).includes(name)){
        this.updated_column_names_map[focus_db][name] = [];
      }
      // types
      if(!Object.keys(this.updated_column_types_map).includes(focus_db)){
        this.updated_column_types_map[focus_db] = {};
      }
      if(!Object.keys(this.updated_column_types_map[focus_db]).includes(name)){
        //"value type reset!"
        this.updated_column_types_map[focus_db][name] = [];
        // add types
        colNames.forEach((colName,index)=>{
          this.updated_column_types_map[focus_db][name].push("string");
        });

        // infer types from data
        let data = this.focus_table["data"];

        // if this table is not constructed from csv.
        // then just use the 1st row to infer types.
        if(!is_csv)
        {
          // infer data types using the 1st row
          let firstRow = data[0];
          colNames.forEach((colName,index)=>{
            let value = firstRow[colName];
            if(typeof(value) == 'number'){
              if((value+"").includes(".")){
                this.updated_column_types_map[focus_db][name][index] = 'float';
              }
              else{
                this.updated_column_types_map[focus_db][name][index] = 'integer';
              }
            }
          });
        }
      }

      let table_to_new_col_names = this.updated_column_names_map[focus_db];
      new_col_names = table_to_new_col_names[name];
      this.display_table(colNames,this.focus_table["data"],new_col_names,is_csv);
    },
    loaddatabase: async function(name) {
      if(name != this.csv_database_name){
        const db_response = await fetch("api/database/get/" + name);
        this.tables = await db_response.json();
        const table_name = Object.keys(this.tables)[0];
        this.loadtable(table_name);
      }
      else{
        // this database is created from csv file
        const table_name = Object.keys(this.csv_tables)[0];
        this.load_csv_table(table_name);
      }
      
    },
    loadtable: function(name) {
      this.focus_table = {};
      this.focus_table["name"] = name;
      let cols = [];
      let colNames = [];
      let new_col_names = [];
      for (const col in this.tables[name][0]) {
        cols.push({
          id: col,
          label: col
        });
      }
      for (const col in this.tables[name][0]) {
        colNames.push(col);
      }
      this.after_loading_table(colNames,cols,name,false);
    },
    load_csv_table: function(name){
      // if this table is created by uploading a csv file.
      // then this method should be used rather than the loadtable method.
      this.focus_table = {};
      this.focus_table["name"] = this.csv_database_name;
      this.focus_table_name = this.csv_database_name;
      let cols = [];
      let colNames = [];

      for (const col in this.csv_tables[name][0]) {
        cols.push({
          id: col,
          label: col
        });
      }

      for (const col in this.csv_tables[name][0]) {
        colNames.push(col);
      }
      
      this.focus_db = this.csv_database_name;
      this.after_loading_table(colNames,cols,name,true);
    },
    query: async function() {
      this.queryloading = true;
      this.sql_highlighted = "";
      let request = {};
      request["query"] = this.question;
      request["db"] = this.focus_db;
      const response = await fetch("api/query", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
      });
      const json = await response.json();
      this.sql = json.sql
      this.queryloading = false;
    },
    onclick_upload: function() {
      let files =$('#csv_file_input').prop('files');
        if(files.length > 1){
            console.error("cannot accept multiple files");
            // currently only work with single csv files
            this.error_in_parsing = true;
            this.error_msg_in_parsing = "Only one csv file can be chosen.";
            return;
      }
      let dataFile = files[0];
      if(dataFile){
        let fileName = dataFile.name;
        let fileSizeInBytes = dataFile.size;
        if (fileSizeInBytes > 2048 * 2048){
          let error = "File size cannot exceed 2 MB.";
          this.error_in_parsing = true;
          this.error_msg_in_parsing = error;
          return;
        }
        
        this.csv_file_name = fileName;
        this.file_reader.readAsText(dataFile,"utf-8");
      }
      else{
        console.log("no file is selected");
      }
    },
    parse_csv_string: function(csv_string) {
      const output = [];
      let vue_instance = this;
      parse(csv_string, {
        trim: true,
        skip_empty_lines: true
      })
      .on('readable', function(){
        let record;
        while (record = this.read()) {
          output.push(record)
        }
      })
      .on('end', function(){
        let error = vue_instance.get_error_msg(csv_string);
        if(error.length != 0){
          vue_instance.error_in_parsing = true;
          vue_instance.error_msg_in_parsing = error;
        }
        else{
          vue_instance.construct_table(output);
        }
        
      })
      .on('error',function(e){
        let errorMsg = e+"";
        let error = vue_instance.get_error_msg(csv_string);
        vue_instance.error_in_parsing = true;
        if(error.length != 0){
          vue_instance.error_msg_in_parsing = error;
        }
        else{
          vue_instance.error_msg_in_parsing = "Error in parsing this csv file. Invalid record length found.";
        }
      });
    },
    get_error_msg: function(csv_string) {
      let lines = csv_string.split("\n");
      let column_num = -1;
      let column_checked = false;
      for(let i=0; i<lines.length; i++){
        let line = lines[i].trim();
        if(line.length == 0){
          continue;
        }
        if(!column_checked){
          column_num = line.split(',').length;
          column_checked = true;
          continue;
        }
        let row_elements = line.split(',');
        let rec_column_num = row_elements.length;
        if(rec_column_num != column_num){
          return `Error in parsing this csv file. Invalid record length found at line ${i+1}.`;
        }
        for(let j=0;j<rec_column_num;j++){
          let value = row_elements[j].trim();
          if(value.length == 0){
            return `Error in parsing this csv file. The value at line ${i+1}, column ${j+1} is null.`;
          }
        }
      }
      if(!column_checked){
        return `Empty file is not acceptable.`;
      }
      return '';
    },
    check_column_names: function(column_names){
      let match = true;
      let regex = this.column_regex;
      
      for(let i=0; i<column_names.length; i++){
        let name = column_names[i].trim();
        if(!regex.test(name)){
          match = false;
          break;
        }
      }
      return match;
    },
    construct_table: function(data_list){
        this.loading = true;
        let table_data = [];
        let column_names = [];
        let focus_db = this.csv_database_name;
        let tableName = this.csv_file_name.replace(".csv","");
        let default_type_init = false;

        function float2int (value) {
          return value | 0;
        }

        function updateType(type_list,index,this_type){
          let last_type = type_list[index];
          if(last_type == this_type){
            return type_list;
          }
          if(this_type == 'string'){
            type_list[index] = this_type;
            return type_list;
          }
          else if(this_type == 'float' && last_type == 'integer'){
            type_list[index] = this_type;
            return type_list;
          }
          return type_list;
        }
        for(let row_index=0; row_index < data_list.length; row_index ++){
          if(row_index === 0){
            column_names = data_list[row_index];
            if(!this.check_column_names(column_names)){
              this.error_in_parsing = true;
              // column name error
              this.error_msg_in_parsing = "Invalid column names. Only letters/numbers/underscores are accepted."
              this.loading = false;
              return;
            }
          }
          else{
            // current type update rule:
            // integer ==> float
            // integer, float ==> string
            let record_dict= {};
            let row = data_list[row_index];
            if(!default_type_init){
              let types = [];
              column_names.forEach((_)=>{
                types.push("integer");
              });
              if(!Object.keys(this.updated_column_types_map).includes(focus_db)){
                this.updated_column_types_map[focus_db] = {};
              }
              if(!Object.keys(this.updated_column_types_map[focus_db]).includes(tableName)){
                this.updated_column_types_map[focus_db][tableName] = types;
              }
              default_type_init = true;
            }

            //"full value type infer!"
            column_names.forEach((col_name,col_index)=>{
                let number_or_nan = +row[col_index];
                let types = this.updated_column_types_map[focus_db][tableName];
                if(isNaN(number_or_nan)){
                  // this is not a valid number
                  record_dict[col_name] = row[col_index];
                  let new_types = updateType(types,col_index,'string');
                  this.updated_column_types_map[focus_db][tableName] = new_types;
                }
                else{
                  if (float2int(number_or_nan) == number_or_nan){
                    // this is an integer
                    record_dict[col_name] = number_or_nan;
                    let new_types = updateType(types,col_index,'integer');
                    this.updated_column_types_map[focus_db][tableName] = new_types;
                  }
                  else{
                    // keep 2 digits after decimal place.
                    record_dict[col_name] = +(number_or_nan.toFixed(2));
                    let new_types = updateType(types,col_index,'float');
                    this.updated_column_types_map[focus_db][tableName] = new_types;
                  }
                }
                
            });
            if(row_index > this.max_csv_row_number){
              break;
            }
            
            table_data.push(record_dict);
            this.focus_db = this.csv_database_name;
          }
        }
        
        let tableList = this.databases[this.csv_database_name]
        if ($.isArray(tableList)){
          tableList.push(tableName);
        }
        else{
          tableList = [tableName];
        }

        this.csv_tables[tableName] = table_data;
        this.load_csv_table(tableName);
        this.loading = false;
        this.showSwitchDBModal = false;
    },
    on_open_switch_database_modal:function(){
      this.error_in_parsing = false;
      this.showSwitchDBModal = true;
    },
    display_table: function(header_name_list, tabledata, new_col_names,is_csv,enable_toggle_box=false){

      let p = $( ".sql" ).last();
      let winHeight = $(window).height();
      let htmlHeight = $(document).height();
      let remainHeight = winHeight - p.offset().top;
      let columnList = [];
      let columns_for_filters = [];
      let intersection = new_col_names.filter(x => header_name_list.includes(x));
      let types = this.updated_column_types_map[this.focus_db][this.focus_table_name];
      let tabledata_column_updated = [];
      let enableRefactoring = false;
      let name_mapper = {};
      let target_columns;
      let vue_instance = this;

      if(enable_toggle_box){
        columnList.push({formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerSort:false, cellClick:function(e, cell){
        cell.getRow().toggleSelect();},width:20});
      }
      //TODO: need to implement the delete/add buttons above the table

      enableRefactoring = (new_col_names.length != 0 && intersection.length != header_name_list.length);

      if(enableRefactoring){
        // refactor the data so the new column names can be used.
        if(header_name_list.length != new_col_names.length){
          // error found
          let error = "Error in mapping the old header names to new header names";
          console.error(error);
          // These two logs are really necessary. Please don't remove them.
          console.log('header_name_list',header_name_list);
          console.log('new_col_names',new_col_names);
          this.show_system_error(error);
          return;
        }
        name_mapper = {};
        target_columns = new_col_names;
      }
      else{
        target_columns = header_name_list;
      }

      // define table column / row operations
      //define row context menu contents
      let rowMenu = [
          {
              label:`<i class="fa fa-plus" aria-hidden="true"></i> Add Row`,
              action:function(e, row){
                  add_new_row();
                  if(is_csv){
                    vue_instance.csv_tables[vue_instance.focus_table_name] = vue_instance.table.getData();
                  }
                  else{
                    vue_instance.tables[vue_instance.focus_table_name] = vue_instance.table.getData();
                  }
              }
          },
          {
              separator:true,
          },
          {
              label:`<i class="fa fa-trash-o" aria-hidden="true"></i> Delete Row`,
              action:function(e, row){
                  row.delete();
                  if(is_csv){
                    vue_instance.csv_tables[vue_instance.focus_table_name] = vue_instance.table.getData();
                  }
                  else{
                    vue_instance.tables[vue_instance.focus_table_name] = vue_instance.table.getData();
                  }
              }
          },
      ]

      function removeKeyFromObjectList(list,key){
        for(let i=0; i< list.length; i++){
          if(Object.keys(list[i]).includes(key)){
            delete list[i][key];
          }
          else{
            console.error('list[i][key] error!');
            vue_instance.show_system_error("Cannot remove column due to key error.");
          }
          
        }
        return list;
      }

      function add_new_row(){
        
        //clean any filters
        vue_instance.on_clear_filter_btn_clicked();
        //add empty row
        let row = vue_instance.table.addRow({});
        row.then(function(row){
            row.scrollTo();
        })
        .catch(function(error){
            vue_instance.show_system_error("Cannot add new row.");
        });
      }

      //define row context menu
      let headerMenu = [
          {
              label:`<i class="fa fa-pencil" aria-hidden="true"></i> Edit Schema`,
              action:function(e, column){
                vue_instance.on_click_schema_setting_btn();
              }
          },
          {
              label:`<i class="fa fa-plus" aria-hidden="true"></i> Add Column`,
              action:function(e, column){
                vue_instance.on_open_add_column_modal();
              }
          },
          {
              separator:true,
          },
          {
              label:`<i class="fa fa-trash-o" aria-hidden="true"></i> Delete Column`,
              action:function(e, column){
                  let table_name = vue_instance.focus_table_name;
                  let colName = column._column.component._column.field;
                 
                  column.delete();
                  // remove column from the filter list
                  let removed_column_index = vue_instance.table_column_names_for_filters.findIndex((name)=>{return name == colName});
                  let original_col_name = header_name_list[removed_column_index];
                  vue_instance.table_column_names_for_filters = vue_instance.table_column_names_for_filters.filter((s)=>{return s != colName});
                  // remove column from the table
                  if(is_csv){
                    let table = vue_instance.csv_tables[vue_instance.focus_table_name];
                    
                    vue_instance.tables[vue_instance.focus_table_name] = removeKeyFromObjectList(table,original_col_name);
                  }
                  else{
                    let table = vue_instance.tables[vue_instance.focus_table_name];
                    vue_instance.tables[vue_instance.focus_table_name] = removeKeyFromObjectList(table,original_col_name);
                  }
                  
                  // update type information
                  types.splice(removed_column_index,1);
                  vue_instance.updated_column_types_map[vue_instance.focus_db][vue_instance.focus_table_name] = types;
                  // update name information

                  target_columns.splice(removed_column_index,1);
                  vue_instance.updated_column_names_map[vue_instance.focus_db][vue_instance.focus_table_name] = target_columns;
              }
          }
      ]

      target_columns.forEach((headerName,index)=>{
        let type = types[index]; // integer, float, string
        let sortType = type;
        let validatorType = "string"
        if(type == "integer" || type == "float"){
          sortType = "number";
        }
        if(type == "float"){
          validatorType = "numeric";
        }
        else if(type == "integer"){
          validatorType = "integer";
        }
        else if(type == "string"){
          validatorType = "";
        }
        let header_info = {'title':`${headerName} <small class="text-muted">(${type})</small>`,
                        'field':headerName,
                        'editor':"input",
                        'sorter':sortType,
                        'headerMenu':headerMenu,
                        // 'editableTitle':true doesn't work properly here. Don't use.
                        }
        if(validatorType.length != ""){
          header_info['validator']= [validatorType];
        }
        columnList.push(header_info);
        name_mapper[this.focused_table_column_names[index]] = headerName;
      });


      tabledata.forEach((dict_data)=>{
        let record = {};
        let old_cols_in_record = Object.keys(dict_data);
        old_cols_in_record.forEach((old_col,col_index)=>{
          let value = dict_data[old_col];
          let type = types[col_index];
          try{
            if(type == 'integer'){
              value = parseInt(""+value);
            }
            else if(type == 'float'){
              value = parseFloat("" + value);
            }
          }
          catch(e){
            // keep the original format
          }
          if(enableRefactoring){
            record[name_mapper[old_col]] = value;
          }
          else{
            record[old_col] = value;
          }
          
        });
        tabledata_column_updated.push(record);
      });
      tabledata = tabledata_column_updated;
      columns_for_filters = target_columns;
      
      this.filterOps = "";
      this.on_clear_filter_btn_clicked();

      // maxHeight:remainHeight -50 - 70, // set height of table
      // create table
      this.table = new Tabulator("#data-table", {
        height:remainHeight -50 - 70,
        autoResize:true,
        resizableColumns:true,
        resizableRows:false,
        data:tabledata, //assign data to table
        layout:"fitColumns", //fit columns to width of table (optional)
        rowContextMenu: rowMenu, //add context menu to rows
        //error if sorter is "date"
        columns: columnList,
        addRowPos:"bottom",
        dataEdited:function(data){
          //data - the updated table data
          if(is_csv){
            vue_instance.csv_tables[vue_instance.focus_table_name] = data;
          }
          else{
            vue_instance.tables[vue_instance.focus_table_name] = data;
          }
        },
      });

      this.table_column_names_for_filters = columns_for_filters;

    },
    update_filter:function(){
        let operation = this.filterOps;
        let column_name = this.filter_column_name;
        let valueEl = $("#filter-value").val();
        if(operation.length == 0){
          return;
        }
        if(this.filter_column_name){
          this.table.setFilter(column_name,operation, valueEl);
        }
    },
    on_filter_btn_clicked: function(){
    },
    on_clear_filter_btn_clicked: function(){
      this.filterOps = "";
      this.filter_column_name = "";
      if(this.table.clearFilter){
        this.table.clearFilter();
      }
      $('#filter-value').val("");
    },
    on_chosen_filter_column: function(e){
      let selected_col = $(e.target).attr("value");
      this.filter_column_name = selected_col;
    },
    on_click_schema_setting_btn: function(){
      let vue_instance = this;
      let mapper_key_length = Object.keys(this.updated_column_names_map[this.focus_db]).length; // number of tables
      let this_table_name = this.focus_table_name;
      if(mapper_key_length === 0){
        this.updated_column_names_map[this.focus_db] = {};
      }
      let col_name_length = Object.keys(this.updated_column_names_map[this.focus_db][this_table_name]).length;
      if(col_name_length === 0){
        this.updated_column_names_map[this.focus_db][this_table_name] = this.focused_table_column_names;
      }
      this.show_schema_setting_modal = true;

      // set up types

      let types = this.updated_column_types_map[this.focus_db][this_table_name];
      let typesOriginal = JSON.parse(JSON.stringify(types));
      $('.column-type-btn').each((index,btn)=>{
        $(btn).html(`${types[index]}<span class="caret text-muted"></span>`);
      });

      $('.column-type').off('click');
      $('.column-type').on('click',(e)=>{
        let order = +($(e.target).attr('order'));
        types[order] = $(e.target).attr('value');
        $($('.column-type-btn')[order]).html(`${types[order]}<span class="caret text-muted"></span>`);
      });

      $('#cancelUpdateSchemaBtn').off('click');
      $('#cancelUpdateSchemaBtn').on('click',(e)=>{
        this.updated_column_types_map[this.focus_db][this_table_name] = typesOriginal;
        this.show_schema_setting_modal = false;
      });

      let all_inputs = $('.col-rename-input');

      $('.col-rename-input').off('keyup');
      $('.col-rename-input').on('keyup',(e)=>{
        $('.column_error').html("");
        let input_col_name = $(e.target).val();
        all_inputs.each((index,input)=>{
          let current_input_index = +($(e.target).attr("index"));
          if(current_input_index == index){
            //continue
          }
          else if(input_col_name.toLowerCase().trim() == $(input).val().toLowerCase().trim()){
            let error_msg = `Name conflicts with column ${index+1}`;
            vue_instance.column_error_msgs[current_input_index] = error_msg
            $('#column_error_' + current_input_index).html(error_msg);
          }
        });
      });

    },
    on_click_update_schema_btn: function(){
      let updated_col_names = [];
      $('.col-rename-input').each((index,input)=>{
        let newColumn = $(input).val().trim();
        if(newColumn.length == 0){
          updated_col_names.push(this.focused_table_column_names[index]);
        }
        else{
          updated_col_names.push(newColumn);
        }
      });
      this.updated_column_names_map[this.focus_db][this.focus_table_name] = updated_col_names;
      this.refreshtable(this.focus_table_name);
      this.show_schema_setting_modal = false;
    },
    show_system_error: function(error_msg){
      this.system_error_message = error_msg.trim();
      setTimeout(()=>{
        this.system_error_message = "";
      },2000)
    },
    on_open_add_column_modal: function(){
      let vue_instance = this;
      vue_instance.show_add_column_modal = true;
      vue_instance.error_msg_in_adding_column = " ";
      $('#col-add-input').val("");
      $('#cancelAddColumnBtn').off('click');
      $('#cancelAddColumnBtn').on('click',(e)=>{
        e.preventDefault();
        vue_instance.show_add_column_modal = false;
      });
      $('.column-type').off('click');
      $('.column-type').on('click',(e)=>{
        e.preventDefault();
        let type = $(e.target).attr('value');
        $('#new_column_type_btn').html(`${type}<span class="caret text-muted"></span>`);
        $('#new_column_type_btn').attr("value",type);
        $('#col-default-input').off("keyup");
        if(type == "integer"){
          $('#col-default-input').val("0");
          $('#col-default-input').attr("type","text");
          $('#col-default-input').on("keyup",(e)=>{
            let val = $('#col-default-input').val();
            val = val.replace(/[^0-9]/g,'');
            $('#col-default-input').val(val);
          });
        }
        else if(type == "float"){
          $('#col-default-input').val("0.0");
          $('#col-default-input').attr("type","number");
        }
        else{
          $('#col-default-input').val("");
          $('#col-default-input').attr("type","text");
        }
      });
      $('#col-add-input').off('keyup');
      $('#col-add-input').on('keyup',(e)=>{
        let col_name = $('#col-add-input').val();
        let regex = vue_instance.column_regex;
        if(!regex.test(col_name)){
          vue_instance.error_msg_in_adding_column = "Invalid column name";
        }
        else{
          // valid syntax
          // check if column name is used
          // to avoid conflicts. this name cannot be the same as 
          // 1) original column name
          // 2) updated column name
          let v = vue_instance;
          let original_column_names = v.focused_table_column_names;
          original_column_names = original_column_names.map(s => s.toLowerCase().trim());

          let column_names_after_modification = v.updated_column_names_map[v.focus_db][v.focus_table_name];
          column_names_after_modification = column_names_after_modification.map(s => s.toLowerCase().trim());
          
          let col_name_lower = col_name.toLowerCase().trim();
          


          if(original_column_names.includes(col_name_lower)){
            vue_instance.error_msg_in_adding_column = "Column name cannot be the same as any of the original column names.";

          }
          else if(column_names_after_modification.includes(col_name_lower)){
            vue_instance.error_msg_in_adding_column = "Column name cannot be the same as any of the current column names.";
          }
          else{
            // valid!
            vue_instance.error_msg_in_adding_column = "";
          }
        }
      });
    },
    on_click_add_column_btn: function(){
      let is_schema_modal_opened = this.show_schema_setting_modal;
      let col_name = $('#col-add-input').val();
      let type = $('#new_column_type_btn').attr("value");
      let this_table = this.tables[this.focus_table_name];
      let default_value = $('#col-default-input').val();
      if(this.focus_db == this.csv_database_name){
        this_table = this.csv_tables[this.focus_table_name];
      }
      // modify the table data
      this_table.forEach((row)=>{
        row[col_name] = default_value;
      });
      this.updated_column_types_map[this.focus_db][this.focus_table_name].push(type);
      let new_column_names = this.updated_column_names_map[this.focus_db][this.focus_table_name];
      if(new_column_names.length != this.focused_table_column_names.length){
        new_column_names = JSON.parse(JSON.stringify(this.focused_table_column_names));
        this.updated_column_names_map[this.focus_db][this.focus_table_name] = new_column_names;
      }
      this.updated_column_names_map[this.focus_db][this.focus_table_name].push(col_name);
      this.refreshtable(this.focus_table_name);
      this.show_schema_setting_modal = false;
      this.show_add_column_modal = false;
      setTimeout(()=>{
        if(is_schema_modal_opened){
          this.on_click_schema_setting_btn();
          $("#schema_modal_body").animate({ scrollTop: $('#schema_modal_body').prop("scrollHeight")}, 500);
        }
      },1);
    }
  }
};
</script>

<style scoped lang="scss">
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,500;1,500&display=swap');
  // @import url('https://unpkg.com/tabulator-tables@4.7.1/dist/css/tabulator.min.css');
  // @import url('../../../node_modules/tabulator-tables/dist/css/bootstrap/tabulator_bootstrap4.min.css');
  @import url('../../../node_modules/tabulator-tables/dist/css/bootstrap/tabulator_bootstrap4.min.css');
.action {
  margin-top: 15px;

  > button {
    width: 100%;
  }
}

.modal-action {
  margin-top: 20px;
  margin-bottom: 20px;

  > button {
    margin-bottom: 20px;
  }
}
.query {
  > h3 {
    margin-top: 0px;
  }

  > input {
    width: 100%;
  }
}

.datatable {
  position: fixed;
  bottom: 0px;
  max-height: 350px;
  overflow-y: auto;
}

.database-nodes {
  // max-height: 300px;
  height: 100%;
  overflow-y: auto;
}

.btn-group {
  height: 48px;
}

.loader-button {
  border: 3px solid #f3f3f3; /* Light grey */
  border-top: 3px solid #1aa15f; /* Blue */
  width: 30px;
  height: 30px;
}

.sql {
  padding: 15px 5px;
}

.sql-container {
  > code {
   border: 0;
    padding: 0px;
  }
}

.datatable-margin {
  margin-left: 28px;
  margin-right: 28px;
}

.btn-default
{
  background-color: #1AA15F;
  color:#FFF;
  border-color: #bbbbbb;
}

.table-font-size
{
  font-size: 14px;
}

.art-font{
  font-family: 'Montserrat', sans-serif;
}

.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}

// drop up start



.dropup {
  position: relative;
  display: inline-block;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropup-content {
  display: none;
  position: absolute;
  min-width: 20em;
  bottom: 14px;
  z-index: 1;
}

.dropdown-content {
  display: none;
  position: absolute;
  min-width: 20em;
  bottom: 0px;
  z-index: 100000;
}


.dropup-content a {
  text-decoration: none;
  display: block;
}

.dropdown-content a {
  text-decoration: none;
  display: block;
}

.dropup-content a:hover {background-color: #ccc}

.dropdown-content a:hover {background-color: #ccc}

.dropup:hover .dropup-content {
  display: block;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.shadow{
	box-shadow:0 10px 16px 0 rgba(0,0,0,0.2);
}
// dropup ends

.column-type {
  height: 32px;
  font-size:14px;
  padding-top: 3px;
  padding-bottom: 0px;
  width: 90px;
}

.filter-col-btn {
  font-size:14px;
}

.column-type-btn{
  min-width: 86px;
}

.modal-body {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

</style>