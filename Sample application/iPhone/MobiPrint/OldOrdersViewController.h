#import <UIKit/UIKit.h>

#import <CoreData/CoreData.h>

#import "CurrentOrderDetailViewController.h"

@interface OldOrdersViewController : UITableViewController <NSFetchedResultsControllerDelegate>

+ (void)setCurrentOrderViewController:(CurrentOrderDetailViewController*)controller;

@property (strong, nonatomic) NSFetchedResultsController *fetchedResultsController;
@property (strong, nonatomic) NSManagedObjectContext *managedObjectContext;

@property (nonatomic, retain) IBOutlet UILabel *ordersCountLabel;

- (void)updateOrders;

@end
