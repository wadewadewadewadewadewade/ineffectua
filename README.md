# ineffectua
 
My wife is living in a broken body. But you cannot see the breaks by looking at her outside. On the outside she looks fine. But inside there is an invisible illness that is breaking her apart in little pieces. I love my wife very much, and in helping her prepare for her many doctor visits there are so many details, so many notes and bits of data it is useful to track: both for her and for her doctors.
 
And she is not alone. There are thousands of others around the world that also have invisible illnesses. Lupus, fibromyalgia, and many varieties of auto-immune diseases abound, just to name a few classes of invisible illness.
 
The intent of this app is to help people with chronic illnesses track their medical issues and appointments, to help them feel a bit of control in their treatment.
 
The goals of this app are pretty lofty; I should look into 501(c)(3) to see if I can get any help on developing and paying for the infrastructure.
 
## Screens
 
As of Sept 2020, I see this app having  screens
* [Authentication](#authentication)
* [Navigational components](#navigational-components): tabs at the bottom, a header a the top, and a drawer on the left
  1. [Appointments](#appointments)
  2. [Contacts](#contacts)
  3. [Meds](#meds) (Medications)
  4. [Pain Log](#pain-log) (log of symptoms and severity)
  5. [Social pages](#social-pages) of multiple types
* Also some [lock-screen](#lock-screen) features
 
### Authentication
 
Authentication is just the simple 'sign in' page with the ability to register new users.  Ideally the app would use a service that supported multiple sign in/up methods such as Facebook, Twitter, Google, etc.
 
##### <span style="color:red">Status:</span>
* Currently only Google auth is enabled
 
### Navigational Components
 
It makes sense to put the less frequently used features in the drawer on the left of the window, and the general screen categories in the tabs at the bottom of the window.
* Drawer
  * User image (if provided) and email, to show who is currently authenticated
  * Sign Out button
  * If tracking menstrual cycle, allow user to start/stop period & ovulation here
  * [Contacts](#contacts)
    * recently added contacts
    * Add contact (also can add contacts from the Calendar->Add Appointment screen)
  * Profile information
    * Theme color
    * Calendar types (Can also add calendar types via [calendar](#appointments) and [pain log](#pain-log)
    * Tags describing diagnosed illness (and/or caretaker status), including ability to add tags
  * [Lock-screen](#lock-screen) configuration
* Tabs
  * [Appointments](#appointments) (default selection) - agenda view initial screen
  * [Social Pages](#social-pages)
  * [Pain Log](#pain-log)
  * [Meds](#meds)
 
##### <span style="color:red">Status:</span>
* Currently the drawer and tabs are built, but neither is configured completely.
* Currently the Drawer only contains the dark theme toggle, and the tabs displayed are not the correct tabs.
* Currently the URLs and document header/titles are not correct.
 
### Appointments
 
Appointments are just a simple calendar with date information (specified below), optionally connecting an event in time with a contact and/or a medication prescription date. The appointments can have a type, which can be created and named arbitrarily by the user, and these types can also be referenced by the pain log.
 
So for example, if you're seeing a doctor about a back pain, that doctor (via [contacts](#contacts)), the severity and location of the pain, and appointments with that doctor could all be grouped under a "type" of 'back pain'.
 
#### Views are:
* Agenda
* Calendar list (scrollable)
* Calendar day
* Add event
 
 
##### <span style="color:red">Status:</span>
* Currently calendar listing, calendar day, and add date functionality is loosely built as I was learning React Native, but there are many bugs to fix and styles to make pretty as well as more functionality to add
 
### Contacts
 
I don't imagine this feature would get used frequently, but it can tie together some other features such as connecting meds and appointments and who to call for refills. Also, I'd like to provide a way for the user to allow for a contact to appear on the lockscreen so they or a medical professional has quick access to call them even if the phone is locked.
 
The user can add a contact directly via the drawer at the left of the screen, or via the [appontments](#appointments) calendar, as they enter an upcoming appointment or revise a past appointment.
 
The contact can optionally have a "type", which is the same "type" used by [appointments](#appointments), [contacts](#contacts), and [medications](#meds).
 
#### Views are:
* List contacts
* Contact detail
* Add contact
 
##### <span style="color:red">Status:</span>
* Not yet started
 
### Lock-screen
 
I'd like to let the user make available on the lock-screen any number of the the following features, *only if they want to*:
* a list of the meds the user is currently taking
  * along with when they were last taken
* An emergency contact from their [contacts](#contacts) list
  * The ability to call that contact
 
##### <span style="color:red">Status:</span>
* Not yet started
 
### Meds
 
A list of medications configurable by the user, with each entry having the following property:
* refill date
* prescribing doctor (from [contacts](#contacts))
* Reminder alarm configuration for when to take the medication
 
#### Views are:
* List meds (sorted by: active, prescription date, next refill date)
* Med detail
* Add med
 
##### <span style="color:red">Status:</span>
* Not yet started
 
### Pain Log
 
The pain log is an SVG image of a figure, front and back, that the user can add/move marks on top of. These marks are versioned (like source code) to allow the user to move through time using a scrub bar to show how their symptoms have progressed/are progressing.
* The user can touch to add a new pain location, or drag an existing location to a new position
* Each location has a title, a severity level, and optionally a description
  * The location can also have a "type", using the same types list as [appointments](#appointments) and [meds](#meds), and [contacts](#contacts)
* As a result of the versioning system, each addition/change to the list of location information has a date/time attached by default. Tho I expect if the user makes 5 changes tot eh same location in 10 minutes, the system will only store the final state of that location - some sort of window-of-change behavior so that only the important information is saved to avoid data pollution
* For women (who are more likely to have an auto-immune illness), the user can also track their menstrual cycle to see correlations between symptoms and her cycle, as there can be connections, like with endometriosis
 
#### Views are:
* Figure view (with scrub bar and menstrual cycle indicator)
* Pain log location detail (doubles as add pin log location view)
 
##### <span style="color:red">Status:</span>
* Not yet started, but the SVG figure exists as does the mark SVG
 
#### Social Pages
 
I'd like to add a social feature to this app; the intent of which is twofold:
1. Provide a way for the chronically ill (or caretakers) to connect with others who are experiencing similar situations to share information
2. Incentivise users to use the app by maybe making it not so much of a data-entry chore, so they can perhaps be better at being their own patient advocate
 
* Their profile (which is private by default), can display their diagnosis and symptoms, which were entered as 'tags' via the [navigational component](#navigational-components) drawer
  * Also, if the user is a caregiver (also via the [navigational component](#navigational-components) drawer) that information can be shown here
* Users can rate/share information about doctors (possibly sharing or attaching that information to a [contact record](#contacts)?), hospitals, medications (possibly sharing or attaching that information to a [medication record](#meds)?), and treatments.
* Searching for others by diagnosis/tag is possible
  * Direct/private messaging from user to user
  * Users can build support groups by one user acting as a moderator, adding multiple users to the same group
* Other administrator-interactive features might be useful to motivate users to share their stories, such as a weekly video submission suggestion where users submit short videos and some administrator of the app can post those to a YouTube channel for the app in general?
 
##### <span style="color:red">Status:</span>
* Not yet started
 
## `Coder Information/notes below here`
 
### User Data
 
```
{
  theme: Theme,
  user: firebase.User
  dates: Hash<CalendarEntry>
}
```
 
##### <span style="color:red">Status:</span>
* Calendar dates and some user data are all that is currently stored in a Firebase back-end

### NoSQL database structure
* {UserID}
  * email
  * photoUrl
  * themeName
  * tags
    * {TagID}
      * name
  * datatypes
    * {DataTypeID}
      * title
      * color
  * calendars
    * {CalendarID}
      * typeId
      * title
      * window
        * starts (timestamp)
        * ends (timestamp)
      * description
      * contacts
        * contactId 1
        * contactId 2
        * etc
  * meds
    * {MedID}
      * typeId
      * name
      * prescribed (timestamp)
      * lastFilled (timestamp)
      * refillsRemaining (number)
      * contacts
        * contactId 1
        * contactId 2
        * etc
  * contacts
    * {ContactID}
      * typeId
      * name
      * phoneNumber
      * email
      * description
      * location
  * painlog
    * version (number) <-- for versioning - [see description below](#description-of-painlog-versioning)
    * locations
      * {LocationID}
        * created (DateTime)
        * typeId
        * x (percentage)
        * y (percentage)
        * title
        * active (boolean)
        * description
        * severity (number)
        * medId

#### Description of Painlog Versioning

To support versioning, take this set of records below as an example:
* painlog
  * 2020-08-30T00:00:00Z
    * aaa111
      * typeId:1
      * x:30.000 (30% into figure image from left edge)
      * y:17.000 (17% down into firgure image from top edge)
      * title:'toothache'
      * active:true
      * severity:6
  * 2020-08-31T00:00:00Z
    * bbb222
      * typeId:1
      * x:30.000 (30% into figure image from left edge)
      * y:17.000 (17% down into firgure image from top edge)
      * title:'headache'
      * active:true
      * severity:7
    * ccc333
      * typeId:2
      * x: 10.000
      * y: 90.000
      * title:'twisted ankle'
      * active:true
      * severity:4
  * 2020-09-01T00:00:00Z
    * bbb222
      * active:false
    * ccc333
      * severity: 2

So using the data above:
1. one location was entered on 8/30
2. two locations were enterd on 8/31, with no changes to the location entered on 8/30
3. one location was changed to inactive on 9/1, and another location had it's severity reduced on that same day
4. so on 9/1 the only locations left active are aaa111 and ccc333, and ccc333 has a reduced severity

I dom't know if that versioning system will work well while allowing the user to scrub through them - I'm hoping that most lookups have an O(1) time complexity - but we'll see I suppose

### Notes to Self
 
* https://callstack.github.io/react-native-paper/theming.html
* https://github.com/react-navigation/react-navigation/tree/main/example
* https://docs.expo.io/guides/using-firebase/
* https://redux.js.org/recipes/usage-with-typescript
* https://github.com/wix/react-native-calendars
 
I had to edit /android/build.gradle to set the minSdkversion to 28 (>= 20) to [support multidex](https://developer.android.com/studio/build/multidex). 
 
### Next
 
* Add CalendarTypes for classification of different symptoms
* fix header and document titling on navigation
* style CalendarEntry
* etc

