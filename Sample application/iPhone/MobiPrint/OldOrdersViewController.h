#import <UIKit/UIKit.h>

#import <CoreData/CoreData.h>

@interface OldOrdersViewController : UITableViewController <NSFetchedResultsControllerDelegate>

@property (strong, nonatomic) NSFetchedResultsController *fetchedResultsController;
@property (strong, nonatomic) NSManagedObjectContext *managedObjectContext;

@property (nonatomic, retain) IBOutlet UILabel *ordersCountLabel;

@end
