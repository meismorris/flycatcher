// Sample reading used when there is no API key, so the whole flow can be tried anywhere.
export const DEMO = {
  photo_check: { retake_board: true, board_issues: ['glare'], retake_flyers: [{ position: 'top right', reason: 'glare' }] },
  flyers: [
    { position: 'top left', kind: 'event', title_text: 'POTTERY NIGHT', display_title: 'Pottery Night', date_text: 'Fri Nov 6', time_text: '7pm', display_place: 'Art Building 102', category: 'art', description: 'Throw your first bowl on the wheel. Clay, aprons and glaze included.', evidence: 'Fri Nov 6 7pm' },
    { position: 'top middle', kind: 'event', title_text: 'OPEN MIC', display_title: 'Open Mic Night', date_text: 'Sat 11/7', time_text: '8-10pm', display_place: 'Union Lounge', category: 'music', description: 'Five-minute slots for songs, poems and stand-up.', evidence: 'Sat 11/7 8-10pm' },
    { position: 'top right', kind: 'event', title_text: 'Info Night', display_title: 'Info Night', date_text: 'Nov 1', time_text: '5:30', display_place: 'Engineering 140', category: 'info_session', description: 'Meet the design team.', evidence: 'Nov 1? 5:30', possible_readings: [{ field: 'date_text', options: ['Nov 1', 'Nov 10'] }] },
    { position: 'middle', kind: 'resource', title_text: 'FREE FLU SHOTS', display_title: 'Free flu shots', date_text: null, display_place: 'Health Center', category: null, description: 'Walk-in flu shots for students.' },
    { position: 'bottom left', kind: 'event', title_text: 'Dumpling Social', display_title: 'Dumpling Social', date_text: 'Tue Nov 10', time_text: '6 PM', display_place: 'Dining Commons', price_text: '$5', category: 'food', description: 'Fold, steam and eat.', evidence: 'Tue Nov 10 6 PM' },
    { position: 'bottom right', kind: 'event', title_text: 'HACK NIGHT', display_title: 'Hack Night', date_text: 'Nov 14', time_text: '7pm', display_place: 'CS Lab', category: 'tech', description: 'Build something small in four hours.', evidence: 'Nov 14 7pm' }
  ]
};
