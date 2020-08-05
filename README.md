# ineffectua

My wife is living in a broken body. But you cannot see the breaks by looking at her outside. On the outside she looks fine. But inside there is an invisible illness that is breaking her apart in little pieces. I love my wife very much, and in helping her prepare for her many doctor visits there are so many details, so many notes and bits of data it is useful to track: both for her and for her doctors.

And she is not alone. There are thousands of others around the world that also have invisible illnesses. Lupus, fibromyalgia, and many varieties of auto-immune diseases abound, just to name a few classes of invisible illness.

The intent of this app is to help people with chronic illnesses track their medical issues and appointments, to help them feel a bit of control in their treatment.

# User Data

``{
  theme: Theme,
  user: firebase.User
}``

# Notes to Self

* https://callstack.github.io/react-native-paper/theming.html
* https://github.com/react-navigation/react-navigation/tree/main/example
* https://docs.expo.io/guides/using-firebase/
* https://redux.js.org/recipes/usage-with-typescript
* https://github.com/wix/react-native-calendars

# Updates to react-native-calendars

## calendar and agenda

I modified `node_modules/react-native-calendars/src/calendar/index.js` and `node_modules/react-native-calendars/src/agenda/index.js` to fix how ViewPropTypes isn't a thing in react anymore, changing instances of the following...

```
const viewPropTypes = ViewPropTypes || View.propTypes || PropTypes;
...
style: viewPropTypes.style,
```

...to...

```
//const viewPropTypes = ViewPropTypes || View.propTypes || PropTypes; // <--removed this
...
style: PropTypes.shape({
  style: PropTypes.any,
}),
```

## calendar-list item

In `node_modules/react-native-calendars/src/calendar-list/item.js` I had to make the changes to line 64 shown below:
```
style={[{height: this.props.calendarHeight, width: this.props.calendarWidth}, this.style.calendar, this.props.style]}

became

style={[{height: this.props.calendarHeight, width: this.props.calendarWidth}, this.style.calendar, this.props.style].reduce(((r, c) => Object.assign(r, c)), {})}
```