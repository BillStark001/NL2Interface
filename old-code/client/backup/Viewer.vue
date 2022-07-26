<template>
  <div class="py-5">
    <vue-single-select
      v-model="database_name"
      placeholder="Select a database"
      :options="database_list"
    ></vue-single-select>
    <div v-if="!loading">
      <ul class="nav nav-tabs">
        <li class="nav-item" v-for="(item, db_name) in database_metadata">
          <a
            class="nav-link"
            v-bind:class="{ active: db_name == focus_db }"
            @click="focus_db = db_name"
            href="#"
          >{{db_name}}</a>
        </li>
      </ul>
      <table class="table" v-if="focus_db !== '' && database_metadata[focus_db]">
        <thead>
          <tr>
            <th v-for="col in database_metadata[focus_db]['cols']" scope="col">{{col}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in database_metadata[focus_db]['rows'].slice(0,3)">
            <th v-for="cell in row">{{cell}}</th>
          </tr>
        </tbody>
      </table>
      <div class="form-group">
        <label for="exampleInputEmail1">Enter query</label>
        <input
          type="text"
          class="form-control"
          v-model="question"
          placeholder="What is the average and maximum age of all singers?"
        />
      </div>
      <button type="submit" class="btn btn-primary" v-if="!chatloading" @click="query">Submit</button>
      <button class="btn btn-primary" type="button" disabled v-else>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading...
      </button>
      <div v-if="!chatloading && queryresponse" class="text-left mt-3">
        <p><strong>Question:</strong> {{queryresponse.question}}</p>
        <p><strong>SQL Response:</strong> {{queryresponse.res}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import VueSingleSelect from "vue-single-select";

export default {
  data() {
    return {
      database_list: [],
      database_name: {},
      database_metadata: {},
      focus_db: "",
      loading: true,
      chatloading: false,
      question: "",
      queryresponse: undefined
    };
  },
  components: {
    VueSingleSelect
  },
  mounted: async function() {
    const response = await fetch("api/database/list");
    const json = await response.json();
    this.database_list = json["databases"];
  },
  watch: {
    database_name: async function(name) {
      if (name) {
        this.loading = true;
        const response = await fetch("api/database/get/" + name);
        const json = await response.json();
        this.database_metadata = json;
        this.focus_db = Object.keys(json)[0];
        this.loading = false;
      }
    }
  },
  methods: {
    query: async function() {
      this.chatloading = true;
      this.res = undefined;
      const query = {
        db_id: this.$data.database_name,
        question: this.$data.question
      };
      const response = await fetch("api/query", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(query)
      });
      const json = await response.json()
      this.queryresponse = {}
      this.queryresponse["question"] = this.$data.question;
      this.queryresponse["res"] = json["res"]
      this.chatloading = false;
    }
  }
};
</script>

<style scoped lang="scss">
h3 {
  font-size: 15px;
  font-weight: 400;
}
</style>
