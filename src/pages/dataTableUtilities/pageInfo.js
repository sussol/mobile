import { buttonStrings, modalStrings, pageInfoStrings } from '../../localization';
import { formatDate } from '../../utilities';

const PAGE_INFO_PARTS = pageObject => ({
  entryDate: {
    title: `${pageInfoStrings.entry_date}:`,
    info: formatDate(pageObject.entryDate) || 'N/A',
  },
  confirmDate: {
    title: `${pageInfoStrings.confirm_date}:`,
    info: formatDate(pageObject.confirmDate),
  },
  enteredBy: {
    title: `${pageInfoStrings.entered_by}:`,
    info: pageObject.enteredBy && pageObject.enteredBy.username,
  },
  customer: {
    title: `${pageInfoStrings.customer}:`,
    info: pageObject.otherParty && pageObject.otherParty.name,
  },
  theifRef: {
    title: `${pageInfoStrings.their_ref}:`,
    info: pageObject.theirRef,
    onPress: openTheirRefEditor,
    editableType: 'text',
  },
  comment: {
    title: `${pageInfoStrings.comment}:`,
    info: transaction.comment,
    onPress: openCommentEditor,
    editableType: 'text',
  },
});
