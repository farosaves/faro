<script lang="ts">
  // based on suggestions from:
  // Sami Keijonen https://webdesign.tutsplus.com/tutorials/how-to-make-custom-accessible-checkboxes-and-radio-buttons--cms-32074
  // and Inclusive Components by Heydon Pickering https://inclusive-components.design/toggle-button/

  export let options: Array<any>
  // export let legend;
  export let userSelected = options[0].value

  const uniqueID = Math.floor(Math.random() * 100)

  const slugify = (str = "") => str.toLowerCase().replace(/ /g, "-").replace(/\./g, "")
</script>

{#each options as value}
  <div class="form-control">
    <label class="label cursor-pointer">
      <span class="label-text">{value}</span>
      <input type="radio" name="radio-{uniqueID}" class="radio" bind:group={userSelected} {value} />
    </label>
  </div>
{/each}
